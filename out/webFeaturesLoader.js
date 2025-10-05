"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebFeatures = initializeWebFeatures;
exports.getCSSFeature = getCSSFeature;
exports.getHTMLFeature = getHTMLFeature;
exports.getAllFeatures = getAllFeatures;
let webFeaturesData = {};
let cssPropertyMap = new Map();
let htmlElementMap = new Map();
async function initializeWebFeatures() {
    try {
        // Try to load the official web-features package when available
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const wf = require('web-features');
            // wf may export a function or an object; normalize to our shape if needed
            webFeaturesData = (wf && wf.default) || wf;
        }
        catch (e) {
            // Fallback to bundled sample data
            webFeaturesData = getWebFeaturesData();
        }
        buildFeatureMaps();
    }
    catch (error) {
        console.error('Failed to load web-features data:', error);
    }
}
function buildFeatureMaps() {
    // Clear previous maps
    cssPropertyMap = new Map();
    htmlElementMap = new Map();
    // Build CSS property map
    for (const [featureId, feature] of Object.entries(webFeaturesData)) {
        if (featureId.startsWith('css-')) {
            const propertyName = extractCSSPropertyName(featureId);
            if (propertyName) {
                cssPropertyMap.set(propertyName, feature);
            }
        }
        else if (featureId.startsWith('html-')) {
            const elementName = extractHTMLElementName(featureId);
            if (elementName) {
                htmlElementMap.set(elementName, feature);
            }
        }
    }
}
function extractCSSPropertyName(featureId) {
    // Remove 'css-' prefix and convert to property name
    const name = featureId.replace('css-', '').replace(/-/g, '-');
    return name;
}
function extractHTMLElementName(featureId) {
    // Remove 'html-' prefix
    const name = featureId.replace('html-', '');
    return name;
}
function getCSSFeature(property) {
    return cssPropertyMap.get(property.toLowerCase());
}
function getHTMLFeature(element) {
    return htmlElementMap.get(element.toLowerCase());
}
function getAllFeatures() {
    return webFeaturesData;
}
// Sample web-features data structure
// In production, this would be loaded from the actual web-features package
function getWebFeaturesData() {
    return {
        'css-container-queries': {
            name: 'CSS Container Queries',
            description: 'Container queries allow styling elements based on the size of their container',
            baseline: {
                status: 'newly',
                low_date: '2023-02-14',
                high_date: '2023-08-14'
            },
            spec: 'https://drafts.csswg.org/css-contain-3/',
            mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries',
            caniuse: 'css-container-queries'
        },
        'css-aspect-ratio': {
            name: 'CSS aspect-ratio property',
            description: 'The aspect-ratio CSS property sets a preferred aspect ratio for elements',
            baseline: {
                status: 'widely',
                low_date: '2021-09-14',
                high_date: '2024-03-14'
            },
            mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio',
            caniuse: 'mdn-css_properties_aspect-ratio'
        },
        'css-grid': {
            name: 'CSS Grid Layout',
            description: 'CSS Grid Layout is a two-dimensional layout system for the web',
            baseline: {
                status: 'widely',
                low_date: '2017-03-07',
                high_date: '2019-09-07'
            },
            mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout',
            caniuse: 'css-grid'
        },
        'css-subgrid': {
            name: 'CSS Subgrid',
            description: 'Allows grid items to participate in their parent grid',
            baseline: {
                status: 'newly',
                low_date: '2023-09-15',
                high_date: '2024-03-15'
            },
            mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Subgrid',
            caniuse: 'css-subgrid'
        },
        'css-has': {
            name: 'CSS :has() pseudo-class',
            description: 'Selects elements that contain specific descendants',
            baseline: {
                status: 'newly',
                low_date: '2023-12-14',
                high_date: '2024-06-14'
            },
            mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:has',
            caniuse: 'css-has'
        },
        'css-nesting': {
            name: 'CSS Nesting',
            description: 'Native CSS nesting without preprocessors',
            baseline: {
                status: 'newly',
                low_date: '2023-08-29',
                high_date: '2024-02-29'
            },
            mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting',
            caniuse: 'css-nesting'
        },
        'html-dialog': {
            name: 'HTML Dialog Element',
            description: 'Native modal dialog element',
            baseline: {
                status: 'widely',
                low_date: '2022-03-15',
                high_date: '2024-09-15'
            },
            mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog',
            caniuse: 'dialog'
        },
        'html-details': {
            name: 'HTML Details Element',
            description: 'Creates a disclosure widget',
            baseline: {
                status: 'widely',
                low_date: '2020-01-15',
                high_date: '2022-07-15'
            },
            mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details',
            caniuse: 'details'
        },
        'css-scroll-snap': {
            name: 'CSS Scroll Snap',
            description: 'Controls scrolling snap points',
            baseline: {
                status: 'widely',
                low_date: '2019-09-09',
                high_date: '2022-03-09'
            },
            mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scroll_Snap',
            caniuse: 'css-snappoints'
        },
        'css-cascade-layers': {
            name: 'CSS Cascade Layers (@layer)',
            description: 'Control cascade priority with explicit layers',
            baseline: {
                status: 'newly',
                low_date: '2022-03-15',
                high_date: '2024-09-15'
            },
            mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@layer',
            caniuse: 'css-cascade-layers'
        }
    };
}
//# sourceMappingURL=webFeaturesLoader.js.map