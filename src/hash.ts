import { createHash } from "crypto"
import { openSync, readSync, closeSync, statSync } from "fs"

// Increased buffer size from 1KB to 64KB for better performance
// Larger buffer reduces system calls and improves I/O throughput
const bufferSize = 64 * 1024

const buffer = Buffer.alloc(bufferSize)

export function hashFile(filePath: string) {
  const sha = createHash("sha256")
  const fileDescriptor = openSync(filePath, "r")
  const size = statSync(filePath).size
  let totalBytesRead = 0
  while (totalBytesRead < size) {
    const bytesRead = readSync(
      fileDescriptor,
      buffer,
      0,
      Math.min(size - totalBytesRead, bufferSize),
      totalBytesRead,
    )
    if (bytesRead < bufferSize) {
      sha.update(buffer.slice(0, bytesRead))
    } else {
      sha.update(buffer)
    }
    totalBytesRead += bytesRead
  }
  closeSync(fileDescriptor)
  return sha.digest("hex")
}
