# patch-package

This package is a forked version of the official
[patch-package](https://www.npmjs.com/package/patch-package). Its main purpose
is to fix a security vulnerability (MEDIUM SEVERITY) reported by Snyk,
identified as
[SNYK-JS-INFLIGHT-6095116](https://security.snyk.io/vuln/SNYK-JS-INFLIGHT-6095116).

![snyk-finding-inflight](/snyk-finding-inflight.png)

## Usage

### Making patches

Make changes to files of a particular package in your node_modules folder, then
run

    yarn patch-package package-name

Its usage is exactly the same as original version. For more detail
documentation, please refer to the official
[patch-package](https://www.npmjs.com/package/patch-package).
