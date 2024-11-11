# @naandalist/patch-package

This package is a forked version of the official
[patch-package](https://www.npmjs.com/package/patch-package). Its main purpose
is to fix a security vulnerability (MEDIUM, and HIGH SEVERITY).

## Security Improvements

This fork fix all security vulnerabilities identified by Snyk:

| No. | Issue Type                                           | Dependency    | Severity  | Vulnerability ID                                                                       |
| --- | ---------------------------------------------------- | ------------- | --------- | -------------------------------------------------------------------------------------- |
| 1   | Regular Expression Denial of Service (ReDoS)         | `cross-spawn` | High 🚨   | [SNYK-JS-CROSSSPAWN-8303230](https://security.snyk.io/vuln/SNYK-JS-CROSSSPAWN-8303230) |
| 2   | Inefficient Regular Expression Complexity            | `micromatch`  | High 🚨   | [SNYK-JS-MICROMATCH-6838728](https://security.snyk.io/vuln/SNYK-JS-MICROMATCH-6838728) |
| 3   | Missing Release of Resource after Effective Lifetime | `inflight`    | Medium 🚨 | [SNYK-JS-INFLIGHT-6095116](https://security.snyk.io/vuln/SNYK-JS-INFLIGHT-6095116)     |


<!-- ![snyk-finding-inflight](/snyk-finding-inflight.png) -->

## Installation

```bash
npm install @naandalist/patch-package
# or
yarn add @naandalist/patch-package
```

## Usage

The usage remains identical to the original patch-package, maintaining full
compatibility while providing enhanced security.

### Creating Patches

1. Make your changes to package files in the `node_modules` folder
2. Run the following command:

```bash
# Using yarn
yarn patch-package package-name

# Using npm
npx patch-package package-name
```

### Applying Patches

Patches are automatically applied when you run:
```bash
yarn install
# or
npm install
```

For detailed usage instructions and advanced features, please refer to the
[original patch-package documentation](https://www.npmjs.com/package/patch-package).

## Why Use This Fork?

- ✅ All original functionality preserved
- 🛡️ Snyk finding security vulnerabilities fixed
- 💪 Regular security maintenance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT - See [LICENSE](LICENSE) for details.

---

For more details, please visit
[GitHub repository](https://github.com/naandalist/patch-package).
