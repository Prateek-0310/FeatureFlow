// src/hoverProvider.ts
import * as vscode from 'vscode';
import { getCSSFeature, getHTMLFeature } from './webFeaturesLoader';

export class FeatureFlowHoverProvider implements vscode.HoverProvider {
    private documentType: 'css' | 'html';

    constructor(documentType: 'css' | 'html') {
        this.documentType = documentType;
    }

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {
        const wordRange = document.getWordRangeAtPosition(position, /[a-z-]+/i);
        if (!wordRange) {
            return null;
        }

        const word = document.getText(wordRange).toLowerCase();
        
        if (this.documentType === 'css') {
            return this.provideCSSHover(word, wordRange);
        } else {
            return this.provideHTMLHover(word, wordRange);
        }
    }

    private provideCSSHover(property: string, range: vscode.Range): vscode.Hover | null {
        const feature = getCSSFeature(property);
        
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
        } else {
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

    private provideHTMLHover(element: string, range: vscode.Range): vscode.Hover | null {
        const feature = getHTMLFeature(element);
        
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
        } else {
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

    private getStatusEmoji(status: string | undefined): string {
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

    private getStatusText(status: string | undefined): string {
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

    private formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch {
            return dateString;
        }
    }
}