# @naandalist/patch-package

> **Deprecated.** This package is no longer maintained.
>
> Do not use it in new projects. Existing users should migrate off it.

This was a fork of [patch-package](https://github.com/ds300/patch-package) v8.0.0, published to address Snyk findings in dependencies at the time (`cross-spawn`, `micromatch`, `inflight`).

That reason no longer holds. Official [`patch-package@8.0.1`](https://www.npmjs.com/package/patch-package) already addresses the security issues that motivated this fork. Package managers also have native patching now.

Original `patch-package` was created by [David Sheldrick](https://github.com/ds300).

## What to use instead

Pick one:

1. **Official package** — [`patch-package@8.0.1`](https://www.npmjs.com/package/patch-package) (or later)
2. **Native tooling** (preferred if your package manager supports it)
   - Yarn Berry: `yarn patch`
   - pnpm: `pnpm patch`
   - npm 12+: `npm patch`

## Migrate from this fork

```bash
npm uninstall @naandalist/patch-package
npm install -D patch-package
```

Keep your existing `patches/` files. They are compatible with official `patch-package`.

Add or keep this script:

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

If you use Yarn Berry, pnpm, or npm 12+, consider moving those patches to the native patch workflow instead of a `postinstall` hook.

## Status

- No further releases
- No security maintenance
- Issues and PRs will not be reviewed

The npm package should be marked deprecated. After that, this repository can be archived.

## License

MIT — see [LICENSE](LICENSE).
