// src/extension.ts
import * as vscode from 'vscode';
import { FeatureFlowDiagnostics } from './diagnostics';
import { FeatureFlowHoverProvider } from './hoverProvider';
import { generateCompatibilityReport } from './reportGenerator';
import { initializeWebFeatures } from './webFeaturesLoader';

let diagnosticCollection: vscode.DiagnosticCollection;
let diagnosticsProvider: FeatureFlowDiagnostics;

export async function activate(context: vscode.ExtensionContext) {
    console.log('FeatureFlow extension is now active!');

    // Initialize web-features data
    await initializeWebFeatures();

    // Create diagnostic collection
    diagnosticCollection = vscode.languages.createDiagnosticCollection('featureflow');
    context.subscriptions.push(diagnosticCollection);

    // Initialize diagnostics provider
    diagnosticsProvider = new FeatureFlowDiagnostics(diagnosticCollection);

    // Register hover provider for CSS and HTML
    const cssHoverProvider = vscode.languages.registerHoverProvider(
        ['css', 'scss', 'less'],
        new FeatureFlowHoverProvider('css')
    );
    
    const htmlHoverProvider = vscode.languages.registerHoverProvider(
        ['html', 'vue', 'jsx', 'tsx'],
        new FeatureFlowHoverProvider('html')
    );

    context.subscriptions.push(cssHoverProvider, htmlHoverProvider);

    // Register commands
    const generateReportCommand = vscode.commands.registerCommand(
        'featureflow.generateReport',
        async () => {
            await generateCompatibilityReport();
        }
    );

    const refreshDiagnosticsCommand = vscode.commands.registerCommand(
        'featureflow.refreshDiagnostics',
        async () => {
            if (vscode.window.activeTextEditor) {
                await diagnosticsProvider.updateDiagnostics(
                    vscode.window.activeTextEditor.document
                );
                vscode.window.showInformationMessage('FeatureFlow diagnostics refreshed!');
            }
        }
    );

    context.subscriptions.push(generateReportCommand, refreshDiagnosticsCommand);

    // Listen to document changes
    vscode.workspace.onDidChangeTextDocument(async (event: vscode.TextDocumentChangeEvent) => {
        if (isRelevantDocument(event.document)) {
            await diagnosticsProvider.updateDiagnostics(event.document);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidOpenTextDocument(async (document: vscode.TextDocument) => {
        if (isRelevantDocument(document)) {
            await diagnosticsProvider.updateDiagnostics(document);
        }
    }, null, context.subscriptions);

    // Process currently open documents (await each to avoid unhandled promises)
    for (const document of vscode.workspace.textDocuments) {
        if (isRelevantDocument(document)) {
            // eslint-disable-next-line no-await-in-loop
            await diagnosticsProvider.updateDiagnostics(document);
        }
    }

    vscode.window.showInformationMessage('FeatureFlow is ready! 🚀');
}

function isRelevantDocument(document: vscode.TextDocument): boolean {
    const relevantLanguages = ['css', 'scss', 'less', 'html', 'vue', 'jsx', 'tsx'];
    return relevantLanguages.includes(document.languageId);
}

export function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.clear();
        diagnosticCollection.dispose();
    }
}