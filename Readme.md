# 🦛 Hippoo (Yes, hippoo with two o's.)

A lightning-fast CLI tool to check and compare npm package sizes. Get instant insights about package sizes, download times, and make informed decisions about your dependencies.

## 🚀 Installation

You can install Hippoo using either npm or yarn:

```bash
# Using npm
npm install -g hippoo

# Using yarn
yarn global add hippoo
```

## 📖 Usage

```bash
# Check a single package
hippoo react@18.0.0

# Compare multiple packages
hippoo compare react angular
```

## ✨ Features

- 📦 Instant package size analysis
- 🔄 Smart package comparison with detailed metrics
- 🕸️ Network speed-based download time estimation
- 📊 Bundle size breakdown (minified + gzipped)
- 🎯 Package scoring system (0-10)
- 💡 Smart recommendations for different use cases
- 🔍 Tree-shake information
- 📈 Dependency count tracking (🎊 Coming Soon 🎊 )

## 🔍 Analysis Metrics

When analyzing packages, Hippoo provides:

- Bundle Size (minified)
- Gzipped Size
- Download Time estimates
- Dependencies Count
- Tree-Shake Support
- Hippoo Score (0-10)
- Usage Recommendations

## 🛠️ Commands & Options

```bash
hippoo [package-name] [options]       # Analyze single package
hippoo compare [pkg1] [pkg2] [...]    # Compare multiple packages

Options:
  -v, --version        Show version number
  -d, --detailed      Show detailed size breakdown
  -j, --json         Output results in JSON format
  -h, --help         Show help information
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

```
