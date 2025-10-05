// src/diagnostics.ts
import * as vscode from 'vscode';
import { getCSSFeature, getHTMLFeature } from './webFeaturesLoader';
import { scanCSSDocumentWithPostCSS } from './cssScanner';

export class FeatureFlowDiagnostics {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(diagnosticCollection: vscode.DiagnosticCollection) {
        this.diagnosticCollection = diagnosticCollection;
    }

    async updateDiagnostics(document: vscode.TextDocument): Promise<void> {
        const config = vscode.workspace.getConfiguration('featureflow');
        const baselineLevel = config.get<string>('baselineLevel', 'widely');
        
        if (!this.shouldCheckDocument(document)) {
            this.diagnosticCollection.delete(document.uri);
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();

        if (this.isCSSDocument(document)) {
            // Use PostCSS-based scanner for robust CSS feature detection
            const detected = await scanCSSDocumentWithPostCSS(document);
            for (const d of detected) {
                const feature = getCSSFeature(d.id.replace(/^css-/, 'css-') || d.id);
                if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                    const startPos = document.positionAt(d.index);
                    const endPos = document.positionAt(d.index + (d.name ? d.name.length : 1));
                    const range = new vscode.Range(startPos, endPos);

                    const diagnostic = new vscode.Diagnostic(
                        range,
                        this.getDiagnosticMessage(feature.name, feature.baseline?.status),
                        this.getDiagnosticSeverity(feature.baseline?.status)
                    );

                    diagnostic.code = 'featureflow';
                    diagnostic.source = 'FeatureFlow';
                    diagnostics.push(diagnostic);
                }
            }
        } else if (this.isHTMLDocument(document)) {
            this.checkHTMLFeatures(document, text, diagnostics, baselineLevel);
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private shouldCheckDocument(document: vscode.TextDocument): boolean {
        const relevantLanguages = ['css', 'scss', 'less', 'html', 'vue', 'jsx', 'tsx'];
        return relevantLanguages.includes(document.languageId);
    }

    private isCSSDocument(document: vscode.TextDocument): boolean {
        return ['css', 'scss', 'less'].includes(document.languageId);
    }

    private isHTMLDocument(document: vscode.TextDocument): boolean {
        return ['html', 'vue', 'jsx', 'tsx'].includes(document.languageId);
    }

    private checkCSSFeatures(
        document: vscode.TextDocument,
        text: string,
        diagnostics: vscode.Diagnostic[],
        baselineLevel: string
    ): void {
        // Match CSS properties (simple regex - would need improvement for production)
        const cssPropertyRegex = /([a-z-]+)\s*:/gi;
        let match;

        while ((match = cssPropertyRegex.exec(text)) !== null) {
            const property = match[1].toLowerCase();
            const feature = getCSSFeature(property);

            if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[1].length);
                const range = new vscode.Range(startPos, endPos);

                const diagnostic = new vscode.Diagnostic(
                    range,
                    this.getDiagnosticMessage(feature.name, feature.baseline?.status),
                    this.getDiagnosticSeverity(feature.baseline?.status)
                );

                diagnostic.code = 'featureflow';
                diagnostic.source = 'FeatureFlow';
                diagnostics.push(diagnostic);
            }
        }

        // Check for @container queries
        const containerQueryRegex = /@container/gi;
        while ((match = containerQueryRegex.exec(text)) !== null) {
            const feature = getCSSFeature('container-queries');
            if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);

                const diagnostic = new vscode.Diagnostic(
                    range,
                    this.getDiagnosticMessage(feature.name, feature.baseline?.status),
                    this.getDiagnosticSeverity(feature.baseline?.status)
                );

                diagnostic.code = 'featureflow';
                diagnostic.source = 'FeatureFlow';
                diagnostics.push(diagnostic);
            }
        }

        // Check for :has() pseudo-class
        const hasPseudoRegex = /:has\(/gi;
        while ((match = hasPseudoRegex.exec(text)) !== null) {
            const feature = getCSSFeature('has');
            if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);

                const diagnostic = new vscode.Diagnostic(
                    range,
                    this.getDiagnosticMessage(feature.name, feature.baseline?.status),
                    this.getDiagnosticSeverity(feature.baseline?.status)
                );

                diagnostic.code = 'featureflow';
                diagnostic.source = 'FeatureFlow';
                diagnostics.push(diagnostic);
            }
        }

        // Check for @layer
        const layerRegex = /@layer/gi;
        while ((match = layerRegex.exec(text)) !== null) {
            const feature = getCSSFeature('cascade-layers');
            if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);

                const diagnostic = new vscode.Diagnostic(
                    range,
                    this.getDiagnosticMessage(feature.name, feature.baseline?.status),
                    this.getDiagnosticSeverity(feature.baseline?.status)
                );

                diagnostic.code = 'featureflow';
                diagnostic.source = 'FeatureFlow';
                diagnostics.push(diagnostic);
            }
        }
    }

    private checkHTMLFeatures(
        document: vscode.TextDocument,
        text: string,
        diagnostics: vscode.Diagnostic[],
        baselineLevel: string
    ): void {
        // Match HTML opening tags
        const htmlTagRegex = /<(dialog|details|summary|template|slot)[\s>]/gi;
        let match;

        while ((match = htmlTagRegex.exec(text)) !== null) {
            const element = match[1].toLowerCase();
            const feature = getHTMLFeature(element);

            if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                const startPos = document.positionAt(match.index + 1);
                const endPos = document.positionAt(match.index + 1 + match[1].length);
                const range = new vscode.Range(startPos, endPos);

                const diagnostic = new vscode.Diagnostic(
                    range,
                    this.getDiagnosticMessage(feature.name, feature.baseline?.status),
                    this.getDiagnosticSeverity(feature.baseline?.status)
                );

                diagnostic.code = 'featureflow';
                diagnostic.source = 'FeatureFlow';
                diagnostics.push(diagnostic);
            }
        }
    }

    private shouldFlag(status: string | undefined, baselineLevel: string): boolean {
        if (!status) return true; // Flag features without baseline data
        
        if (baselineLevel === 'widely') {
            return status !== 'widely';
        } else if (baselineLevel === 'newly') {
            return status !== 'widely' && status !== 'newly';
        }
        
        return false;
    }

    private getDiagnosticMessage(featureName: string, status: string | undefined): string {
        if (!status) {
            return `${featureName}: No Baseline data available`;
        }
        
        if (status === 'newly') {
            return `${featureName}: Newly Available (may require recent browser updates)`;
        } else if (status === 'limited') {
            return `${featureName}: Limited availability across browsers`;
        }
        
        return `${featureName}: Not widely available`;
    }

    private getDiagnosticSeverity(status: string | undefined): vscode.DiagnosticSeverity {
        if (!status || status === 'limited') {
            return vscode.DiagnosticSeverity.Warning;
        } else if (status === 'newly') {
            return vscode.DiagnosticSeverity.Information;
        }
        
        return vscode.DiagnosticSeverity.Hint;
    }
}