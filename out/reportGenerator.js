"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCompatibilityReport = generateCompatibilityReport;
// src/reportGenerator.ts
const vscode = __importStar(require("vscode"));
const webFeaturesLoader_1 = require("./webFeaturesLoader");
const cssScanner_1 = require("./cssScanner");
async function generateCompatibilityReport() {
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
        await vscode.workspace.fs.writeFile(reportUri, Buffer.from(reportContent, 'utf-8'));
        const doc = await vscode.workspace.openTextDocument(reportUri);
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage(`Report generated: ${fileName}`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to generate report: ${error}`);
    }
}
async function scanWorkspace() {
    const features = new Map();
    const config = vscode.workspace.getConfiguration('featureflow');
    const baselineLevel = config.get('baselineLevel', 'widely');
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
            const detected = await (0, cssScanner_1.scanCSSText)(text, document.languageId);
            for (const d of detected) {
                const feature = (0, webFeaturesLoader_1.getCSSFeature)(d.id);
                if (feature && shouldFlagFeature(feature.baseline?.status, baselineLevel)) {
                    const position = document.positionAt(d.index);
                    addFeatureUsage(features, feature.name, feature.baseline?.status || 'unknown', {
                        file: relativePath,
                        line: position.line + 1,
                        column: position.character + 1
                    }, feature.mdn_url, feature.caniuse);
                }
            }
        }
        else if (document.languageId === 'html') {
            scanHTMLDocument(document, text, relativePath, features, baselineLevel);
        }
    }
    return features;
}
// legacy regex-based CSS scan helper removed; use PostCSS scanner instead
function scanHTMLDocument(document, text, relativePath, features, baselineLevel) {
    const htmlTagRegex = /<(dialog|details|summary|template|slot)[\s>]/gi;
    let match;
    while ((match = htmlTagRegex.exec(text)) !== null) {
        const element = match[1].toLowerCase();
        const feature = (0, webFeaturesLoader_1.getHTMLFeature)(element);
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
function shouldFlagFeature(status, baselineLevel) {
    if (!status)
        return true;
    if (baselineLevel === 'widely') {
        return status !== 'widely';
    }
    else if (baselineLevel === 'newly') {
        return status !== 'widely' && status !== 'newly';
    }
    return false;
}
function addFeatureUsage(features, featureName, status, location, mdnUrl, caniuse) {
    if (features.has(featureName)) {
        features.get(featureName).locations.push(location);
    }
    else {
        features.set(featureName, {
            featureName,
            status,
            locations: [location],
            mdnUrl,
            caniuse
        });
    }
}
function generateMarkdownReport(features) {
    let report = '# FeatureFlow Compatibility Report\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    report += `Total features flagged: ${features.size}\n\n`;
    if (features.size === 0) {
        report += '✅ No compatibility issues found! All features meet your baseline requirements.\n';
        return report;
    }
    report += '---\n\n';
    // Group by status
    const widelyAvailable = [];
    const newlyAvailable = [];
    const limitedAvailable = [];
    const unknown = [];
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
function generateFeatureSection(features) {
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
function generateJSONReport(features) {
    const report = {
        generated: new Date().toISOString(),
        totalFeatures: features.size,
        features: Array.from(features.values())
    };
    return JSON.stringify(report, null, 2);
}
//# sourceMappingURL=reportGenerator.js.map