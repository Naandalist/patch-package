import { join } from "./path"
import { removeSync } from "fs-extra"
import klawSync from "klaw-sync"

export function removeIgnoredFiles(
  dir: string,
  includePaths: RegExp,
  excludePaths: RegExp,
) {
  // Pre-compute the directory prefix to avoid repeated string operations
  const dirPrefix = `${dir}/`
  const dirPrefixLength = dirPrefix.length
  
  klawSync(dir, { nodir: true })
    .map((item) => item.path.slice(dirPrefixLength))
    .filter(
      (relativePath) =>
        !includePaths.test(relativePath) || excludePaths.test(relativePath),
    )
    .forEach((relativePath) => removeSync(join(dir, relativePath)))
}
