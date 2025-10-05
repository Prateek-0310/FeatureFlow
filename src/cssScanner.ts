import * as postcss from 'postcss';
import postcssScss from 'postcss-scss';
import postcssLess from 'postcss-less';
import type { TextDocument } from 'vscode';

export interface DetectedFeature {
    id: string; // feature id used by web-features loader (e.g., 'css-aspect-ratio')
    name: string; // human name
    index: number; // absolute index in document text
}

export async function scanCSSDocumentWithPostCSS(document: TextDocument): Promise<DetectedFeature[]> {
    const text = document.getText();
    const lang = document.languageId;
    const features: DetectedFeature[] = [];

    function offsetFromLineChar(line: number, character: number): number {
        const lines = text.split(/\r\n|\n/);
        let offset = 0;
        for (let i = 0; i < line; i++) {
            offset += lines[i] ? lines[i].length + 1 : 0;
        }
        return offset + character;
    }

    let syntax: unknown = undefined;
    if (lang === 'scss' || lang === 'sass' || lang === 'css') {
        syntax = postcssScss;
    } else if (lang === 'less') {
        syntax = postcssLess;
    }

    let root: postcss.Root;
    if (syntax) {
        // parser has a parse method; narrow its type and call
        const maybeParser = syntax as unknown as { parse?: (input: string, opts?: unknown) => postcss.Root };
        if (typeof maybeParser.parse === 'function') {
            root = maybeParser.parse(text, { from: undefined });
        } else {
            root = postcss.parse(text, { from: undefined });
        }
    } else {
        root = postcss.parse(text, { from: undefined });
    }

    root.walkDecls((decl: postcss.Declaration) => {
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
    root.walkAtRules((atRule: postcss.AtRule) => {
        const name = atRule.name && atRule.name.toLowerCase();
        if (name === 'container') {
            const idx = atRule.source?.start ? offsetFromLineChar(atRule.source.start.line - 1, atRule.source.start.column - 1) : atRule.source?.start?.offset ?? 0;
            features.push({ id: 'css-container-queries', name: 'CSS Container Queries', index: idx });
        } else if (name === 'layer') {
            const idx = atRule.source?.start ? offsetFromLineChar(atRule.source.start.line - 1, atRule.source.start.column - 1) : atRule.source?.start?.offset ?? 0;
            features.push({ id: 'css-cascade-layers', name: 'CSS Cascade Layers (@layer)', index: idx });
        }
    });

    // Walk selectors to find :has()
    root.walkRules((rule: postcss.Rule) => {
        if (rule.selector && rule.selector.includes(':has(')) {
            const idx = rule.source?.start ? offsetFromLineChar(rule.source.start.line - 1, rule.source.start.column - 1) : rule.source?.start?.offset ?? 0;
            features.push({ id: 'css-has', name: 'CSS :has() pseudo-class', index: idx });
        }
    });

    return features;
}

export async function scanCSSText(text: string, languageId = 'css') {
    // helper for tests: returns string positions rather than using TextDocument
    const syntax = languageId === 'less' ? postcssLess : postcssScss;
    let root: postcss.Root;
    const maybeParser = syntax as unknown as { parse?: (input: string, opts?: unknown) => postcss.Root };
    if (typeof maybeParser.parse === 'function') {
        root = maybeParser.parse(text, { from: undefined });
    } else {
        root = postcss.parse(text, { from: undefined });
    }
    const features: { id: string; index: number }[] = [];

    root.walkDecls((decl: postcss.Declaration) => {
        const prop = decl.prop ? decl.prop.toLowerCase() : '';
        if (prop === 'aspect-ratio') {
            features.push({ id: 'css-aspect-ratio', index: decl.source?.start?.offset ?? 0 });
        }
    });

    root.walkAtRules((atRule: postcss.AtRule) => {
        const name = atRule.name && atRule.name.toLowerCase();
        if (name === 'container') {
            features.push({ id: 'css-container-queries', index: atRule.source?.start?.offset ?? 0 });
        } else if (name === 'layer') {
            features.push({ id: 'css-cascade-layers', index: atRule.source?.start?.offset ?? 0 });
        }
    });

    root.walkRules((rule: postcss.Rule) => {
        if (rule.selector && rule.selector.includes(':has(')) {
            features.push({ id: 'css-has', index: rule.source?.start?.offset ?? 0 });
        }
    });

    return features;
}
