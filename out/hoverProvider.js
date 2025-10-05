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
exports.FeatureFlowHoverProvider = void 0;
// src/hoverProvider.ts
const vscode = __importStar(require("vscode"));
const webFeaturesLoader_1 = require("./webFeaturesLoader");
class FeatureFlowHoverProvider {
    constructor(documentType) {
        this.documentType = documentType;
    }
    provideHover(document, position) {
        const wordRange = document.getWordRangeAtPosition(position, /[a-z-]+/i);
        if (!wordRange) {
            return null;
        }
        const word = document.getText(wordRange).toLowerCase();
        if (this.documentType === 'css') {
            return this.provideCSSHover(word, wordRange);
        }
        else {
            return this.provideHTMLHover(word, wordRange);
        }
    }
    provideCSSHover(property, range) {
        const feature = (0, webFeaturesLoader_1.getCSSFeature)(property);
        if (!feature) {
            return null;
        }
        const markdown = new vscode.MarkdownString();
        markdown.isTrusted = true;
        markdown.supportHtml = true;
        // Feature name and description
        markdown.appendMarkdown(`### ${feature.name}\n\n`);
        if (feature.description) {
            markdown.appendMarkdown(`${feature.description}\n\n`);
        }
        // Baseline status
        if (feature.baseline) {
            const status = feature.baseline.status;
            const statusEmoji = this.getStatusEmoji(status);
            const statusText = this.getStatusText(status);
            markdown.appendMarkdown(`**Baseline Status:** ${statusEmoji} ${statusText}\n\n`);
            if (feature.baseline.low_date) {
                markdown.appendMarkdown(`*Available since: ${this.formatDate(feature.baseline.low_date)}*\n\n`);
            }
        }
        else {
            markdown.appendMarkdown(`**Baseline Status:** ⚠️ No baseline data available\n\n`);
        }
        // Links
        if (feature.mdn_url) {
            markdown.appendMarkdown(`📚 [MDN Documentation](${feature.mdn_url})\n\n`);
        }
        if (feature.spec) {
            markdown.appendMarkdown(`📖 [Specification](${feature.spec})\n\n`);
        }
        if (feature.caniuse) {
            markdown.appendMarkdown(`🔍 [Can I Use](https://caniuse.com/${feature.caniuse})\n\n`);
        }
        return new vscode.Hover(markdown, range);
    }
    provideHTMLHover(element, range) {
        const feature = (0, webFeaturesLoader_1.getHTMLFeature)(element);
        if (!feature) {
            return null;
        }
        const markdown = new vscode.MarkdownString();
        markdown.isTrusted = true;
        markdown.supportHtml = true;
        // Feature name and description
        markdown.appendMarkdown(`### ${feature.name}\n\n`);
        if (feature.description) {
            markdown.appendMarkdown(`${feature.description}\n\n`);
        }
        // Baseline status
        if (feature.baseline) {
            const status = feature.baseline.status;
            const statusEmoji = this.getStatusEmoji(status);
            const statusText = this.getStatusText(status);
            markdown.appendMarkdown(`**Baseline Status:** ${statusEmoji} ${statusText}\n\n`);
            if (feature.baseline.low_date) {
                markdown.appendMarkdown(`*Available since: ${this.formatDate(feature.baseline.low_date)}*\n\n`);
            }
        }
        else {
            markdown.appendMarkdown(`**Baseline Status:** ⚠️ No baseline data available\n\n`);
        }
        // Links
        if (feature.mdn_url) {
            markdown.appendMarkdown(`📚 [MDN Documentation](${feature.mdn_url})\n\n`);
        }
        if (feature.spec) {
            markdown.appendMarkdown(`📖 [Specification](${feature.spec})\n\n`);
        }
        if (feature.caniuse) {
            markdown.appendMarkdown(`🔍 [Can I Use](https://caniuse.com/${feature.caniuse})\n\n`);
        }
        return new vscode.Hover(markdown, range);
    }
    getStatusEmoji(status) {
        switch (status) {
            case 'widely':
                return '✅';
            case 'newly':
                return '🆕';
            case 'limited':
                return '⚠️';
            default:
                return '❓';
        }
    }
    getStatusText(status) {
        switch (status) {
            case 'widely':
                return 'Widely Available';
            case 'newly':
                return 'Newly Available';
            case 'limited':
                return 'Limited Availability';
            default:
                return 'Unknown';
        }
    }
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        catch {
            return dateString;
        }
    }
}
exports.FeatureFlowHoverProvider = FeatureFlowHoverProvider;
//# sourceMappingURL=hoverProvider.js.map