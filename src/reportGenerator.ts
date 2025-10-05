// src/reportGenerator.ts
import * as vscode from 'vscode';
import { getCSSFeature, getHTMLFeature } from './webFeaturesLoader';
import { scanCSSText } from './cssScanner';

interface FeatureUsage {
    featureName: string;
    status: string;
    locations: Array<{
        file: string;
        line: number;
        column: number;
    }>;
    mdnUrl?: string;
    caniuse?: string;
}

export async function generateCompatibilityReport(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    // configuration available via vscode.workspace.getConfiguration('featureflow') when needed
    const format = await vscode.window.showQuickPick(['Markdown', 'JSON'], {
        placeHolder: 'Select report format'
    });

    if (!format) {
        return;
    }

    vscode.window.showInformationMessage('Generating compatibility report...');

    try {
        const features = await scanWorkspace();
        const reportContent = format === 'Markdown' 
            ? generateMarkdownReport(features)
            : generateJSONReport(features);

        const extension = format === 'Markdown' ? '.md' : '.json';
        const fileName = `featureflow-report-${Date.now()}${extension}`;
        const reportUri = vscode.Uri.joinPath(workspaceFolders[0].uri, fileName);

        await vscode.workspace.fs.writeFile(
            reportUri,
            Buffer.from(reportContent, 'utf-8')
        );

        const doc = await vscode.workspace.openTextDocument(reportUri);
        await vscode.window.showTextDocument(doc);

        vscode.window.showInformationMessage(`Report generated: ${fileName}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to generate report: ${error}`);
    }
}

async function scanWorkspace(): Promise<Map<string, FeatureUsage>> {
    const features = new Map<string, FeatureUsage>();
    const config = vscode.workspace.getConfiguration('featureflow');
    const baselineLevel = config.get<string>('baselineLevel', 'widely');

    // Find all CSS and HTML files
    const cssFiles = await vscode.workspace.findFiles('**/*.{css,scss,less}', '**/node_modules/**');
    const htmlFiles = await vscode.workspace.findFiles('**/*.{html,htm}', '**/node_modules/**');

    const allFiles = [...cssFiles, ...htmlFiles];

    for (const fileUri of allFiles) {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const text = document.getText();
        const relativePath = vscode.workspace.asRelativePath(fileUri);

            if (document.languageId === 'css' || document.languageId === 'scss' || document.languageId === 'less') {
                // Use PostCSS-based scanning for CSS
                const detected = await scanCSSText(text, document.languageId);
                for (const d of detected) {
                    const feature = getCSSFeature(d.id);
                    if (feature && shouldFlagFeature(feature.baseline?.status, baselineLevel)) {
                        const position = document.positionAt(d.index);
                        addFeatureUsage(features, feature.name, feature.baseline?.status || 'unknown', {
                            file: relativePath,
                            line: position.line + 1,
                            column: position.character + 1
                        }, feature.mdn_url, feature.caniuse);
                    }
                }
            } else if (document.languageId === 'html') {
                scanHTMLDocument(document, text, relativePath, features, baselineLevel);
            }
    }

    return features;
}

// legacy regex-based CSS scan helper removed; use PostCSS scanner instead

function scanHTMLDocument(
    document: vscode.TextDocument,
    text: string,
    relativePath: string,
    features: Map<string, FeatureUsage>,
    baselineLevel: string
): void {
    const htmlTagRegex = /<(dialog|details|summary|template|slot)[\s>]/gi;
    let match;

    while ((match = htmlTagRegex.exec(text)) !== null) {
        const element = match[1].toLowerCase();
        const feature = getHTMLFeature(element);

        if (feature && shouldFlagFeature(feature.baseline?.status, baselineLevel)) {
            const position = document.positionAt(match.index);
            addFeatureUsage(features, feature.name, feature.baseline?.status || 'unknown', {
                file: relativePath,
                line: position.line + 1,
                column: position.character + 1
            }, feature.mdn_url, feature.caniuse);
        }
    }
}

function shouldFlagFeature(status: string | undefined, baselineLevel: string): boolean {
    if (!status) return true;
    
    if (baselineLevel === 'widely') {
        return status !== 'widely';
    } else if (baselineLevel === 'newly') {
        return status !== 'widely' && status !== 'newly';
    }
    
    return false;
}

function addFeatureUsage(
    features: Map<string, FeatureUsage>,
    featureName: string,
    status: string,
    location: { file: string; line: number; column: number },
    mdnUrl?: string,
    caniuse?: string
): void {
    if (features.has(featureName)) {
        features.get(featureName)!.locations.push(location);
    } else {
        features.set(featureName, {
            featureName,
            status,
            locations: [location],
            mdnUrl,
            caniuse
        });
    }
}

function generateMarkdownReport(features: Map<string, FeatureUsage>): string {
    let report = '# FeatureFlow Compatibility Report\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    report += `Total features flagged: ${features.size}\n\n`;

    if (features.size === 0) {
        report += '✅ No compatibility issues found! All features meet your baseline requirements.\n';
        return report;
    }

    report += '---\n\n';

    // Group by status
    const widelyAvailable: FeatureUsage[] = [];
    const newlyAvailable: FeatureUsage[] = [];
    const limitedAvailable: FeatureUsage[] = [];
    const unknown: FeatureUsage[] = [];

    features.forEach(feature => {
        switch (feature.status) {
            case 'widely':
                widelyAvailable.push(feature);
                break;
            case 'newly':
                newlyAvailable.push(feature);
                break;
            case 'limited':
                limitedAvailable.push(feature);
                break;
            default:
                unknown.push(feature);
        }
    });

    if (newlyAvailable.length > 0) {
        report += '## 🆕 Newly Available Features\n\n';
        report += 'These features are recently standardized and may require recent browser updates.\n\n';
        report += generateFeatureSection(newlyAvailable);
    }

    if (limitedAvailable.length > 0) {
        report += '## ⚠️ Limited Availability Features\n\n';
        report += 'These features have limited browser support.\n\n';
        report += generateFeatureSection(limitedAvailable);
    }

    if (unknown.length > 0) {
        report += '## ❓ Unknown Status Features\n\n';
        report += 'These features do not have baseline data available.\n\n';
        report += generateFeatureSection(unknown);
    }

    report += '\n---\n\n';
    report += '*Report generated by FeatureFlow - Stay in the flow with confidence.*\n';

    return report;
}

function generateFeatureSection(features: FeatureUsage[]): string {
    let section = '';

    features.forEach(feature => {
        section += `### ${feature.featureName}\n\n`;
        section += `**Occurrences:** ${feature.locations.length}\n\n`;

        if (feature.mdnUrl) {
            section += `📚 [MDN Documentation](${feature.mdnUrl}) `;
        }
        if (feature.caniuse) {
            section += `| 🔍 [Can I Use](https://caniuse.com/${feature.caniuse})`;
        }
        section += '\n\n';

        section += '**Locations:**\n\n';
        feature.locations.forEach(loc => {
            section += `- \`${loc.file}\` (Line ${loc.line}, Column ${loc.column})\n`;
        });
        section += '\n';
    });

    return section;
}

function generateJSONReport(features: Map<string, FeatureUsage>): string {
    const report = {
        generated: new Date().toISOString(),
        totalFeatures: features.size,
        features: Array.from(features.values())
    };

    return JSON.stringify(report, null, 2);
}