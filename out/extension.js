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
exports.activate = activate;
exports.deactivate = deactivate;
// src/extension.ts
const vscode = __importStar(require("vscode"));
const diagnostics_1 = require("./diagnostics");
const hoverProvider_1 = require("./hoverProvider");
const reportGenerator_1 = require("./reportGenerator");
const webFeaturesLoader_1 = require("./webFeaturesLoader");
let diagnosticCollection;
let diagnosticsProvider;
async function activate(context) {
    console.log('FeatureFlow extension is now active!');
    // Initialize web-features data
    await (0, webFeaturesLoader_1.initializeWebFeatures)();
    // Create diagnostic collection
    diagnosticCollection = vscode.languages.createDiagnosticCollection('featureflow');
    context.subscriptions.push(diagnosticCollection);
    // Initialize diagnostics provider
    diagnosticsProvider = new diagnostics_1.FeatureFlowDiagnostics(diagnosticCollection);
    // Register hover provider for CSS and HTML
    const cssHoverProvider = vscode.languages.registerHoverProvider(['css', 'scss', 'less'], new hoverProvider_1.FeatureFlowHoverProvider('css'));
    const htmlHoverProvider = vscode.languages.registerHoverProvider(['html', 'vue', 'jsx', 'tsx'], new hoverProvider_1.FeatureFlowHoverProvider('html'));
    context.subscriptions.push(cssHoverProvider, htmlHoverProvider);
    // Register commands
    const generateReportCommand = vscode.commands.registerCommand('featureflow.generateReport', async () => {
        await (0, reportGenerator_1.generateCompatibilityReport)();
    });
    const refreshDiagnosticsCommand = vscode.commands.registerCommand('featureflow.refreshDiagnostics', async () => {
        if (vscode.window.activeTextEditor) {
            await diagnosticsProvider.updateDiagnostics(vscode.window.activeTextEditor.document);
            vscode.window.showInformationMessage('FeatureFlow diagnostics refreshed!');
        }
    });
    context.subscriptions.push(generateReportCommand, refreshDiagnosticsCommand);
    // Listen to document changes
    vscode.workspace.onDidChangeTextDocument(async (event) => {
        if (isRelevantDocument(event.document)) {
            await diagnosticsProvider.updateDiagnostics(event.document);
        }
    }, null, context.subscriptions);
    vscode.workspace.onDidOpenTextDocument(async (document) => {
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
function isRelevantDocument(document) {
    const relevantLanguages = ['css', 'scss', 'less', 'html', 'vue', 'jsx', 'tsx'];
    return relevantLanguages.includes(document.languageId);
}
function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.clear();
        diagnosticCollection.dispose();
    }
}
//# sourceMappingURL=extension.js.map