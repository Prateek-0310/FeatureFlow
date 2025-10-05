# FeatureFlow 🚀

**Real-time Baseline compatibility checking for CSS and HTML features directly in VS Code**

FeatureFlow eliminates the "compatibility tax" by bringing official Baseline adoption data from the [web-features](https://github.com/web-platform-dx/web-features) package directly into your editor. Stop context-switching to MDN or Can I Use—code with confidence and stay in the flow.

## ✨ Features

### 🔍 Real-Time Baseline Linting

As you type CSS or HTML, FeatureFlow provides immediate visual feedback for features that aren't yet widely available. Configurable to check against "Newly Available" or "Widely Available" Baseline status.

![Diagnostics Demo](images/diagnostics-demo.gif)

### 💡 On-Hover Compatibility Status

Hover over any CSS property or HTML element to see:
- Current Baseline status (Widely Available, Newly Available, or Limited)
- When the feature became available
- Direct links to MDN documentation and Can I Use data

![Hover Demo](images/hover-demo.gif)

### 📊 Project Compatibility Reports

Generate comprehensive compatibility reports in Markdown or JSON format that scan your entire project and list all non-Baseline features with their locations.

Perfect for:
- Technical debt assessments
- Planning feature adoption roadmaps
- Team audits before production releases

![Report Demo](images/report-demo.gif)

## 🚀 Getting Started

### Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "FeatureFlow"
4. Click Install

### Usage

FeatureFlow works automatically once installed! It will:
- Lint your CSS, SCSS, LESS, and HTML files in real-time
- Show compatibility information when you hover over features
- Provide quick access to documentation

#### Generate a Compatibility Report

1. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "FeatureFlow: Generate Compatibility Report"
3. Choose your preferred format (Markdown or JSON)
4. The report will be generated and opened automatically

## ⚙️ Configuration

Access settings via `File > Preferences > Settings` and search for "FeatureFlow"

### Available Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `featureflow.baselineLevel` | `widely` | Minimum baseline level: `widely` (recommended for production) or `newly` (more permissive) |
| `featureflow.enableDiagnostics` | `true` | Enable real-time diagnostics for non-baseline features |
| `featureflow.showHoverInfo` | `true` | Show baseline information on hover |

### Example Configuration

```json
{
  "featureflow.baselineLevel": "widely",
  "featureflow.enableDiagnostics": true,
  "featureflow.showHoverInfo": true
}
```

## 📋 Supported Features

FeatureFlow currently tracks baseline status for:

### CSS Features
- Container Queries (`@container`)
- `:has()` pseudo-class
- Cascade Layers (`@layer`)
- Subgrid
- CSS Nesting
- `aspect-ratio` property
- Scroll Snap
- And many more...

### HTML Elements
- `<dialog>`
- `<details>` and `<summary>`
- `<template>`
- `<slot>`
- And more...

## 🎯 Use Cases

### For Teams Adopting Modern Features
Confidently use newer CSS/HTML features knowing they meet high standards for browser support.

### For Projects with Backward Compatibility Requirements
Ensure you don't inadvertently introduce features that will break on supported browsers.

### For Educators and Learners
Get real-world context for web features and understand what's safe for production use.

## 📖 What is Baseline?

[Baseline](https://web.dev/baseline) is a unified standard from the Web Platform DX Community Group that identifies when web platform features are safe to use:

- **Widely Available**: Supported in the current and previous major versions of all major browsers for at least 30 months
- **Newly Available**: Available in all major browsers but hasn't reached the 30-month threshold yet

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/featureflow.git
cd featureflow

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package the extension
npm run package
```

### Project Structure

```
featureflow/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── diagnostics.ts         # Diagnostic provider
│   ├── hoverProvider.ts       # Hover information provider
│   ├── reportGenerator.ts     # Report generation logic
│   └── webFeaturesLoader.ts   # Web features data loader
├── package.json               # Extension manifest
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Adding New Features

The extension uses the [web-features](https://www.npmjs.com/package/web-features) npm package. To add support for additional features:

1. Update the feature mappings in `webFeaturesLoader.ts`
2. Add detection patterns in `diagnostics.ts`
3. Test thoroughly with sample CSS/HTML files

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built on top of the [web-features](https://github.com/web-platform-dx/web-features) project
- Baseline initiative by the Web Platform DX Community Group
- Inspired by the need to reduce context-switching in modern web development

## 📬 Support

- 🐛 [Report a Bug](https://github.com/yourusername/featureflow/issues)
- 💡 [Request a Feature](https://github.com/yourusername/featureflow/issues)
- 📖 [Documentation](https://github.com/yourusername/featureflow/wiki)

## 📈 Future Vision

We're just getting started! Here's what's on the roadmap:

### 🔌 Cross-IDE Support
Bringing FeatureFlow to other popular development environments:
- IntelliJ IDEA / WebStorm
- Sublime Text
- Atom
- Vim/Neovim plugins

### 🔷 JavaScript Feature Support
Extending beyond CSS and HTML to cover:
- Modern JavaScript syntax (optional chaining, nullish coalescing, etc.)
- Web APIs (Service Workers, WebRTC, Web Components)
- Browser-specific APIs with Baseline tracking
- ECMAScript proposal stages

### 🏗️ Build Tool Integration
Enforce compatibility standards at build time:
- **Webpack Plugin**: Fail builds when non-Baseline features are detected
- **Rollup Plugin**: Integrate baseline checks into your build pipeline
- **Vite Plugin**: Real-time compatibility validation during development
- **ESLint Plugin**: Add baseline checking to your linting workflow
- CI/CD integration for automated compatibility audits

### 🌍 Community-Driven Growth
We believe in the power of open source:
- **Open Contribution Model**: All features welcome, from bug fixes to major enhancements
- **Community Feature Requests**: Vote on and suggest new capabilities
- **Plugin Ecosystem**: Allow third-party extensions and custom rule sets
- **Localization**: Support for multiple languages and regional browser requirements
- **Custom Baseline Profiles**: Define your own compatibility targets (e.g., "IE11+", "Modern Evergreen")

### 🚀 Advanced Features
- **AI-Powered Polyfill Suggestions**: Automatically recommend and insert appropriate polyfills
- **Performance Impact Analysis**: Show the performance implications of using newer features
- **Automatic Feature Fallbacks**: Generate fallback code for unsupported browsers
- **Team Collaboration**: Share baseline profiles and reports across teams
- **Historical Tracking**: Monitor how your project's baseline coverage evolves over time

### 🤝 Get Involved

Want to help shape the future of FeatureFlow? We'd love your input!

- 🌟 Star us on [GitHub](https://github.com/yourusername/featureflow)
- 💬 Join the [Discussion Forum](https://github.com/yourusername/featureflow/discussions)
- 🎯 Check out [Good First Issues](https://github.com/yourusername/featureflow/labels/good%20first%20issue)
- 📧 Reach out: featureflow@yourproject.com

---

**Stay in the flow with FeatureFlow!** 🌊