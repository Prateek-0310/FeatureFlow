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
exports.FeatureFlowDiagnostics = void 0;
// src/diagnostics.ts
const vscode = __importStar(require("vscode"));
const webFeaturesLoader_1 = require("./webFeaturesLoader");
const cssScanner_1 = require("./cssScanner");
class FeatureFlowDiagnostics {
    constructor(diagnosticCollection) {
        this.diagnosticCollection = diagnosticCollection;
    }
    async updateDiagnostics(document) {
        const config = vscode.workspace.getConfiguration('featureflow');
        const baselineLevel = config.get('baselineLevel', 'widely');
        if (!this.shouldCheckDocument(document)) {
            this.diagnosticCollection.delete(document.uri);
            return;
        }
        const diagnostics = [];
        const text = document.getText();
        if (this.isCSSDocument(document)) {
            // Use PostCSS-based scanner for robust CSS feature detection
            const detected = await (0, cssScanner_1.scanCSSDocumentWithPostCSS)(document);
            for (const d of detected) {
                const feature = (0, webFeaturesLoader_1.getCSSFeature)(d.id.replace(/^css-/, 'css-') || d.id);
                if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                    const startPos = document.positionAt(d.index);
                    const endPos = document.positionAt(d.index + (d.name ? d.name.length : 1));
                    const range = new vscode.Range(startPos, endPos);
                    const diagnostic = new vscode.Diagnostic(range, this.getDiagnosticMessage(feature.name, feature.baseline?.status), this.getDiagnosticSeverity(feature.baseline?.status));
                    diagnostic.code = 'featureflow';
                    diagnostic.source = 'FeatureFlow';
                    diagnostics.push(diagnostic);
                }
            }
        }
        else if (this.isHTMLDocument(document)) {
            this.checkHTMLFeatures(document, text, diagnostics, baselineLevel);
        }
        this.diagnosticCollection.set(document.uri, diagnostics);
    }
    shouldCheckDocument(document) {
        const relevantLanguages = ['css', 'scss', 'less', 'html', 'vue', 'jsx', 'tsx'];
        return relevantLanguages.includes(document.languageId);
    }
    isCSSDocument(document) {
        return ['css', 'scss', 'less'].includes(document.languageId);
    }
    isHTMLDocument(document) {
        return ['html', 'vue', 'jsx', 'tsx'].includes(document.languageId);
    }
    checkCSSFeatures(document, text, diagnostics, baselineLevel) {
        // Match CSS properties (simple regex - would need improvement for production)
        const cssPropertyRegex = /([a-z-]+)\s*:/gi;
        let match;
        while ((match = cssPropertyRegex.exec(text)) !== null) {
            const property = match[1].toLowerCase();
            const feature = (0, webFeaturesLoader_1.getCSSFeature)(property);
            if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[1].length);
                const range = new vscode.Range(startPos, endPos);
                const diagnostic = new vscode.Diagnostic(range, this.getDiagnosticMessage(feature.name, feature.baseline?.status), this.getDiagnosticSeverity(feature.baseline?.status));
                diagnostic.code = 'featureflow';
                diagnostic.source = 'FeatureFlow';
                diagnostics.push(diagnostic);
            }
        }
        // Check for @container queries
        const containerQueryRegex = /@container/gi;
        while ((match = containerQueryRegex.exec(text)) !== null) {
            const feature = (0, webFeaturesLoader_1.getCSSFeature)('container-queries');
            if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);
                const diagnostic = new vscode.Diagnostic(range, this.getDiagnosticMessage(feature.name, feature.baseline?.status), this.getDiagnosticSeverity(feature.baseline?.status));
                diagnostic.code = 'featureflow';
                diagnostic.source = 'FeatureFlow';
                diagnostics.push(diagnostic);
            }
        }
        // Check for :has() pseudo-class
        const hasPseudoRegex = /:has\(/gi;
        while ((match = hasPseudoRegex.exec(text)) !== null) {
            const feature = (0, webFeaturesLoader_1.getCSSFeature)('has');
            if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);
                const diagnostic = new vscode.Diagnostic(range, this.getDiagnosticMessage(feature.name, feature.baseline?.status), this.getDiagnosticSeverity(feature.baseline?.status));
                diagnostic.code = 'featureflow';
                diagnostic.source = 'FeatureFlow';
                diagnostics.push(diagnostic);
            }
        }
        // Check for @layer
        const layerRegex = /@layer/gi;
        while ((match = layerRegex.exec(text)) !== null) {
            const feature = (0, webFeaturesLoader_1.getCSSFeature)('cascade-layers');
            if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);
                const diagnostic = new vscode.Diagnostic(range, this.getDiagnosticMessage(feature.name, feature.baseline?.status), this.getDiagnosticSeverity(feature.baseline?.status));
                diagnostic.code = 'featureflow';
                diagnostic.source = 'FeatureFlow';
                diagnostics.push(diagnostic);
            }
        }
    }
    checkHTMLFeatures(document, text, diagnostics, baselineLevel) {
        // Match HTML opening tags
        const htmlTagRegex = /<(dialog|details|summary|template|slot)[\s>]/gi;
        let match;
        while ((match = htmlTagRegex.exec(text)) !== null) {
            const element = match[1].toLowerCase();
            const feature = (0, webFeaturesLoader_1.getHTMLFeature)(element);
            if (feature && this.shouldFlag(feature.baseline?.status, baselineLevel)) {
                const startPos = document.positionAt(match.index + 1);
                const endPos = document.positionAt(match.index + 1 + match[1].length);
                const range = new vscode.Range(startPos, endPos);
                const diagnostic = new vscode.Diagnostic(range, this.getDiagnosticMessage(feature.name, feature.baseline?.status), this.getDiagnosticSeverity(feature.baseline?.status));
                diagnostic.code = 'featureflow';
                diagnostic.source = 'FeatureFlow';
                diagnostics.push(diagnostic);
            }
        }
    }
    shouldFlag(status, baselineLevel) {
        if (!status)
            return true; // Flag features without baseline data
        if (baselineLevel === 'widely') {
            return status !== 'widely';
        }
        else if (baselineLevel === 'newly') {
            return status !== 'widely' && status !== 'newly';
        }
        return false;
    }
    getDiagnosticMessage(featureName, status) {
        if (!status) {
            return `${featureName}: No Baseline data available`;
        }
        if (status === 'newly') {
            return `${featureName}: Newly Available (may require recent browser updates)`;
        }
        else if (status === 'limited') {
            return `${featureName}: Limited availability across browsers`;
        }
        return `${featureName}: Not widely available`;
    }
    getDiagnosticSeverity(status) {
        if (!status || status === 'limited') {
            return vscode.DiagnosticSeverity.Warning;
        }
        else if (status === 'newly') {
            return vscode.DiagnosticSeverity.Information;
        }
        return vscode.DiagnosticSeverity.Hint;
    }
}
exports.FeatureFlowDiagnostics = FeatureFlowDiagnostics;
//# sourceMappingURL=diagnostics.js.map