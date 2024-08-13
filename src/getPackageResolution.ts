import { join, resolve } from "./path"
import { PackageDetails, getPatchDetailsFromCliString } from "./PackageDetails"
import { PackageManager, detectPackageManager } from "./detectPackageManager"
import { readFileSync, existsSync } from "fs-extra"
import { parse as parseYarnLockFile } from "@yarnpkg/lockfile"
import yaml from "yaml"
import { findWorkspacesRoot } from "find-workspaces"
import { getPackageVersion } from "./getPackageVersion"
import { coerceSemVer } from "./coerceSemVer"

export function getPackageResolution({
  packageDetails,
  packageManager,
  appPath,
}: {
  packageDetails: PackageDetails
  packageManager: PackageManager
  appPath: string
}) {
  const isYarn = packageManager === "yarn"
  const lockfileName = isYarn
    ? "yarn.lock"
    : packageManager === "npm-shrinkwrap"
    ? "npm-shrinkwrap.json"
    : "package-lock.json"
  let lockfilePath = lockfileName
  if (!existsSync(lockfilePath)) {
    const workspaceRoot = findWorkspacesRoot(appPath)
    if (!workspaceRoot) {
      throw new Error(`Can't find ${lockfileName} file`)
    }
    lockfilePath = join(workspaceRoot.location, lockfileName)
  }
  if (!existsSync(lockfilePath)) {
    throw new Error(`Can't find ${lockfileName} file`)
  }
  const lockfileString = readFileSync(lockfilePath, "utf8")

  if (isYarn) {
    let appLockFile: Record<
      string,
      {
        version: string
        resolution?: string
        resolved?: string
      }
    >
    if (lockfileString.includes("yarn lockfile v1")) {
      const parsedYarnLockFile = parseYarnLockFile(lockfileString)
      if (parsedYarnLockFile.type !== "success") {
        throw new Error("Could not parse yarn v1 lock file")
      } else {
        appLockFile = parsedYarnLockFile.object
      }
    } else {
      try {
        appLockFile = yaml.parse(lockfileString)
      } catch (e) {
        console.log(e)
        throw new Error("Could not parse yarn v2 lock file")
      }
    }

    const installedVersion = getPackageVersion(
      join(resolve(appPath, packageDetails.path), "package.json"),
    )

    const entries = Object.entries(appLockFile).filter(
      ([k, v]) =>
        k.startsWith(packageDetails.name + "@") &&
        // @ts-ignore
        coerceSemVer(v.version) === coerceSemVer(installedVersion),
    )

    const resolutions = entries.map(([_, v]) => {
      return v.resolved
    })

    if (resolutions.length === 0) {
      throw new Error(
        `\`${packageDetails.pathSpecifier}\`'s installed version is ${installedVersion} but a lockfile entry for it couldn't be found. Your lockfile is likely to be corrupt or you forgot to reinstall your packages.`,
      )
    }

    if (new Set(resolutions).size !== 1) {
      console.log(
        `Ambiguous lockfile entries for ${packageDetails.pathSpecifier}. Using version ${installedVersion}`,
      )
      return installedVersion
    }

    if (resolutions[0]) {
      return resolutions[0]
    }

    const packageName = packageDetails.name

    const resolutionVersion = entries[0][1].version

    // `@backstage/integration@npm:^1.5.0, @backstage/integration@npm:^1.7.0, @backstage/integration@npm:^1.7.2`
    // ->
    // `^1.5.0 ^1.7.0 ^1.7.2`
    const resolution = entries[0][0]
      .replace(new RegExp(packageName + "@", "g"), "")
      .replace(/npm:/g, "")
      .replace(/,/g, "")

    // resolve relative file path
    if (resolution.startsWith("file:.")) {
      return `file:${resolve(appPath, resolution.slice("file:".length))}`
    }

    // add `resolutionVersion` to ensure correct version, `^1.0.0` could resolve latest `v1.3.0`, but `^1.0.0 1.2.1` won't
    return resolutionVersion ? resolution + " " + resolutionVersion : resolution
  } else {
    const lockfile = JSON.parse(lockfileString)
    const lockfileStack = [lockfile]
    for (const name of packageDetails.packageNames.slice(0, -1)) {
      const { dependencies } = lockfileStack[0]
      if (dependencies && name in dependencies) {
        lockfileStack.push(dependencies[name])
      }
    }

    // Handle Workspaces
    const rootPackageName = `node_modules/${packageDetails.packageNames[0]}`
    const { packages } = lockfile
    if (packages && rootPackageName in packages) {
      if (packages[rootPackageName].link) {
        // It's a workspace
        const { resolved } = packages[rootPackageName]
        if (resolved) {
          packageDetails.workspacePath = packageDetails.path.replace(
            rootPackageName,
            resolved,
          )
        }
      }
    }

    lockfileStack.reverse()
    const relevantStackEntry = lockfileStack.find((entry) => {
      if (entry.dependencies) {
        return entry.dependencies && packageDetails.name in entry.dependencies
      } else if (entry.packages) {
        return (
          entry.packages &&
          (packageDetails.path in entry.packages ||
            packageDetails.workspacePath in entry.packages)
        )
      }
    })

    if (relevantStackEntry === undefined) {
      throw new Error("Cannot find dependencies or packages in lockfile")
    }
    const pkg = relevantStackEntry.dependencies
      ? relevantStackEntry.dependencies[packageDetails.name]
      : relevantStackEntry.packages[packageDetails.path] ||
        relevantStackEntry.packages[packageDetails.workspacePath]

    return pkg.resolved || pkg.version || pkg.from
  }
}

if (require.main === module) {
  const packageDetails = getPatchDetailsFromCliString(process.argv[2])
  if (packageDetails) {
    const cwd = process.cwd()
    console.log(
      getPackageResolution({
        appPath: cwd,
        packageDetails,
        packageManager: detectPackageManager(cwd, null),
      }),
    )
  } else {
    console.log(`Can't find package ${process.argv[2]}`)
    process.exitCode = 1
  }
}
