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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanCSSDocumentWithPostCSS = scanCSSDocumentWithPostCSS;
exports.scanCSSText = scanCSSText;
const postcss = __importStar(require("postcss"));
const postcss_scss_1 = __importDefault(require("postcss-scss"));
const postcss_less_1 = __importDefault(require("postcss-less"));
async function scanCSSDocumentWithPostCSS(document) {
    const text = document.getText();
    const lang = document.languageId;
    const features = [];
    function offsetFromLineChar(line, character) {
        const lines = text.split(/\r\n|\n/);
        let offset = 0;
        for (let i = 0; i < line; i++) {
            offset += lines[i] ? lines[i].length + 1 : 0;
        }
        return offset + character;
    }
    let syntax = undefined;
    if (lang === 'scss' || lang === 'sass' || lang === 'css') {
        syntax = postcss_scss_1.default;
    }
    else if (lang === 'less') {
        syntax = postcss_less_1.default;
    }
    let root;
    if (syntax) {
        // parser has a parse method; narrow its type and call
        const maybeParser = syntax;
        if (typeof maybeParser.parse === 'function') {
            root = maybeParser.parse(text, { from: undefined });
        }
        else {
            root = postcss.parse(text, { from: undefined });
        }
    }
    else {
        root = postcss.parse(text, { from: undefined });
    }
    root.walkDecls((decl) => {
        const prop = decl.prop ? decl.prop.toLowerCase() : '';
        // map common properties to feature ids
        switch (prop) {
            case 'aspect-ratio': {
                const idx = decl.source?.start ? offsetFromLineChar(decl.source.start.line - 1, decl.source.start.column - 1) : decl.source?.start?.offset ?? 0;
                features.push({ id: 'css-aspect-ratio', name: 'CSS aspect-ratio property', index: idx });
                break;
            }
            default:
                break;
        }
    });
    // Walk at-rules: @container, @layer
    root.walkAtRules((atRule) => {
        const name = atRule.name && atRule.name.toLowerCase();
        if (name === 'container') {
            const idx = atRule.source?.start ? offsetFromLineChar(atRule.source.start.line - 1, atRule.source.start.column - 1) : atRule.source?.start?.offset ?? 0;
            features.push({ id: 'css-container-queries', name: 'CSS Container Queries', index: idx });
        }
        else if (name === 'layer') {
            const idx = atRule.source?.start ? offsetFromLineChar(atRule.source.start.line - 1, atRule.source.start.column - 1) : atRule.source?.start?.offset ?? 0;
            features.push({ id: 'css-cascade-layers', name: 'CSS Cascade Layers (@layer)', index: idx });
        }
    });
    // Walk selectors to find :has()
    root.walkRules((rule) => {
        if (rule.selector && rule.selector.includes(':has(')) {
            const idx = rule.source?.start ? offsetFromLineChar(rule.source.start.line - 1, rule.source.start.column - 1) : rule.source?.start?.offset ?? 0;
            features.push({ id: 'css-has', name: 'CSS :has() pseudo-class', index: idx });
        }
    });
    return features;
}
async function scanCSSText(text, languageId = 'css') {
    // helper for tests: returns string positions rather than using TextDocument
    const syntax = languageId === 'less' ? postcss_less_1.default : postcss_scss_1.default;
    let root;
    const maybeParser = syntax;
    if (typeof maybeParser.parse === 'function') {
        root = maybeParser.parse(text, { from: undefined });
    }
    else {
        root = postcss.parse(text, { from: undefined });
    }
    const features = [];
    root.walkDecls((decl) => {
        const prop = decl.prop ? decl.prop.toLowerCase() : '';
        if (prop === 'aspect-ratio') {
            features.push({ id: 'css-aspect-ratio', index: decl.source?.start?.offset ?? 0 });
        }
    });
    root.walkAtRules((atRule) => {
        const name = atRule.name && atRule.name.toLowerCase();
        if (name === 'container') {
            features.push({ id: 'css-container-queries', index: atRule.source?.start?.offset ?? 0 });
        }
        else if (name === 'layer') {
            features.push({ id: 'css-cascade-layers', index: atRule.source?.start?.offset ?? 0 });
        }
    });
    root.walkRules((rule) => {
        if (rule.selector && rule.selector.includes(':has(')) {
            features.push({ id: 'css-has', index: rule.source?.start?.offset ?? 0 });
        }
    });
    return features;
}
//# sourceMappingURL=cssScanner.js.map