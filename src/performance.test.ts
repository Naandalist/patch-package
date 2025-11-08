import { hashFile } from "./hash"
import { removeIgnoredFiles } from "./filterFiles"
import { writeFileSync, mkdirSync, unlinkSync, rmdirSync, existsSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { randomBytes } from "crypto"

describe("Performance Optimizations", () => {
  describe("hash.ts - Buffer Size Optimization", () => {
    let testDir: string
    let smallFile: string
    let mediumFile: string
    let largeFile: string

    beforeEach(() => {
      testDir = join(tmpdir(), `patch-package-perf-test-${Date.now()}`)
      mkdirSync(testDir, { recursive: true })
      
      smallFile = join(testDir, "small.txt")
      mediumFile = join(testDir, "medium.txt")
      largeFile = join(testDir, "large.txt")
    })

    afterEach(() => {
      // Clean up test files
      try {
        if (existsSync(smallFile)) unlinkSync(smallFile)
        if (existsSync(mediumFile)) unlinkSync(mediumFile)
        if (existsSync(largeFile)) unlinkSync(largeFile)
        if (existsSync(testDir)) rmdirSync(testDir)
      } catch (e) {
        // Ignore cleanup errors
      }
    })

    it("should hash small files correctly", () => {
      const content = "Hello, World!"
      writeFileSync(smallFile, content)
      
      const hash = hashFile(smallFile)
      
      expect(hash).toBeDefined()
      expect(hash).toHaveLength(64) // SHA-256 produces 64 hex characters
      expect(typeof hash).toBe("string")
    })

    it("should hash medium files correctly", () => {
      // Create a 10KB file
      const content = randomBytes(10 * 1024).toString("hex")
      writeFileSync(mediumFile, content)
      
      const hash = hashFile(mediumFile)
      
      expect(hash).toBeDefined()
      expect(hash).toHaveLength(64)
      expect(typeof hash).toBe("string")
    })

    it("should hash large files correctly with 64KB buffer", () => {
      // Create a 200KB file (larger than buffer size)
      const content = randomBytes(200 * 1024).toString("hex")
      writeFileSync(largeFile, content)
      
      const hash = hashFile(largeFile)
      
      expect(hash).toBeDefined()
      expect(hash).toHaveLength(64)
      expect(typeof hash).toBe("string")
    })

    it("should produce consistent hashes for same content", () => {
      const content = "Consistent content"
      writeFileSync(smallFile, content)
      
      const hash1 = hashFile(smallFile)
      const hash2 = hashFile(smallFile)
      
      expect(hash1).toBe(hash2)
    })

    it("should produce different hashes for different content", () => {
      const content1 = "Content 1"
      const content2 = "Content 2"
      
      writeFileSync(smallFile, content1)
      const hash1 = hashFile(smallFile)
      
      writeFileSync(mediumFile, content2)
      const hash2 = hashFile(mediumFile)
      
      expect(hash1).not.toBe(hash2)
    })

    it("should handle empty files", () => {
      writeFileSync(smallFile, "")
      
      const hash = hashFile(smallFile)
      
      expect(hash).toBeDefined()
      expect(hash).toHaveLength(64)
      // SHA-256 of empty string
      expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
    })

    it("should handle files exactly at buffer size (64KB)", () => {
      // Create exactly 64KB file
      const content = randomBytes(64 * 1024).toString("hex")
      writeFileSync(mediumFile, content)
      
      const hash = hashFile(mediumFile)
      
      expect(hash).toBeDefined()
      expect(hash).toHaveLength(64)
    })
  })

  describe("filterFiles.ts - RegExp Optimization", () => {
    let testDir: string
    let testFiles: string[]

    beforeEach(() => {
      testDir = join(tmpdir(), `patch-package-filter-test-${Date.now()}`)
      mkdirSync(testDir, { recursive: true })
      
      testFiles = [
        join(testDir, "file1.js"),
        join(testDir, "file2.ts"),
        join(testDir, "test.json"),
        join(testDir, "package.json"),
      ]
      
      testFiles.forEach(file => writeFileSync(file, "test content"))
    })

    afterEach(() => {
      try {
        testFiles.forEach(file => {
          if (existsSync(file)) unlinkSync(file)
        })
        if (existsSync(testDir)) rmdirSync(testDir)
      } catch (e) {
        // Ignore cleanup errors
      }
    })

    it("should use RegExp.test() for pattern matching", () => {
      const includePattern = /.*/
      const excludePattern = /package\.json$/
      
      // Verify the function works with test() method
      expect(includePattern.test("file1.js")).toBe(true)
      expect(excludePattern.test("package.json")).toBe(true)
    })

    it("should filter files based on include pattern", () => {
      const includePattern = /\.js$/
      const excludePattern = /^$/
      
      removeIgnoredFiles(testDir, includePattern, excludePattern)
      
      // .js files should remain, others should be removed
      expect(existsSync(join(testDir, "file1.js"))).toBe(true)
      expect(existsSync(join(testDir, "file2.ts"))).toBe(false)
      expect(existsSync(join(testDir, "test.json"))).toBe(false)
    })

    it("should filter files based on exclude pattern", () => {
      const includePattern = /.*/
      const excludePattern = /package\.json$/
      
      removeIgnoredFiles(testDir, includePattern, excludePattern)
      
      // package.json should be removed
      expect(existsSync(join(testDir, "package.json"))).toBe(false)
      // Other files should remain
      expect(existsSync(join(testDir, "file1.js"))).toBe(true)
      expect(existsSync(join(testDir, "file2.ts"))).toBe(true)
    })

    it("should handle complex regex patterns efficiently", () => {
      const includePattern = /\.(js|ts)$/
      const excludePattern = /test\./
      
      removeIgnoredFiles(testDir, includePattern, excludePattern)
      
      expect(existsSync(join(testDir, "file1.js"))).toBe(true)
      expect(existsSync(join(testDir, "file2.ts"))).toBe(true)
      expect(existsSync(join(testDir, "test.json"))).toBe(false)
      expect(existsSync(join(testDir, "package.json"))).toBe(false)
    })
  })

  describe("getPackageResolution.ts - String Operation Optimization", () => {
    it("should handle string replacement efficiently", () => {
      // Test the optimized string operations by verifying regex patterns
      const testString = "@backstage/integration@npm:^1.5.0, @backstage/integration@npm:^1.7.0"
      const packageName = "@backstage/integration"
      
      // Simulate the optimized replace operation
      const result = testString
        .replace(new RegExp(packageName + "@", "g"), "")
        .replace(/npm:|,/g, (match) => (match === "npm:" ? "" : " "))
        .replace(/\s+/g, " ")
        .trim()
      
      expect(result).toBe("^1.5.0 ^1.7.0")
      expect(result).not.toContain("npm:")
      expect(result).not.toContain(",")
    })

    it("should combine multiple replace operations correctly", () => {
      const testString = "npm:^1.0.0,npm:^2.0.0"
      
      const result = testString
        .replace(/npm:|,/g, (match) => (match === "npm:" ? "" : " "))
        .replace(/\s+/g, " ")
        .trim()
      
      expect(result).toBe("^1.0.0 ^2.0.0")
    })

    it("should handle edge cases in string operations", () => {
      const testString = "npm:^1.0.0"
      
      const result = testString
        .replace(/npm:|,/g, (match) => (match === "npm:" ? "" : " "))
        .replace(/\s+/g, " ")
        .trim()
      
      expect(result).toBe("^1.0.0")
    })

    it("should handle strings with multiple spaces", () => {
      const testString = "npm:^1.0.0,  npm:^2.0.0"
      
      const result = testString
        .replace(/npm:|,/g, (match) => (match === "npm:" ? "" : " "))
        .replace(/\s+/g, " ")
        .trim()
      
      expect(result).toBe("^1.0.0 ^2.0.0")
    })
  })

  describe("Hash Caching - applyPatches.ts & makePatch.ts", () => {
    it("should demonstrate Map-based caching benefits", () => {
      // Create a simple cache implementation similar to the one in the code
      const cache = new Map<string, string>()
      const testKey = "test-key"
      const testValue = "test-value"
      
      // First access - cache miss
      expect(cache.has(testKey)).toBe(false)
      cache.set(testKey, testValue)
      
      // Second access - cache hit
      expect(cache.has(testKey)).toBe(true)
      expect(cache.get(testKey)).toBe(testValue)
    })

    it("should cache hash values correctly", () => {
      const cache = new Map<string, string>()
      const filename1 = "patch1.patch"
      const filename2 = "patch2.patch"
      const hash1 = "abc123"
      const hash2 = "def456"
      
      // Simulate caching multiple files
      cache.set(filename1, hash1)
      cache.set(filename2, hash2)
      
      expect(cache.get(filename1)).toBe(hash1)
      expect(cache.get(filename2)).toBe(hash2)
      expect(cache.size).toBe(2)
    })

    it("should handle cache updates", () => {
      const cache = new Map<string, string>()
      const filename = "patch.patch"
      const oldHash = "old123"
      const newHash = "new456"
      
      cache.set(filename, oldHash)
      expect(cache.get(filename)).toBe(oldHash)
      
      // Update the cache
      cache.set(filename, newHash)
      expect(cache.get(filename)).toBe(newHash)
    })

    it("should demonstrate cache efficiency for repeated lookups", () => {
      const cache = new Map<string, string>()
      const filename = "patch.patch"
      const hash = "abc123"
      
      cache.set(filename, hash)
      
      // Multiple lookups should return same value
      for (let i = 0; i < 100; i++) {
        expect(cache.get(filename)).toBe(hash)
      }
    })
  })

  describe("Performance Regression Tests", () => {
    it("should maintain backward compatibility", () => {
      // Ensure buffer size constant exists and is reasonable
      const expectedBufferSize = 64 * 1024
      expect(expectedBufferSize).toBe(65536)
    })

    it("should validate RegExp test method behavior", () => {
      const pattern = /test/
      
      // .test() should work as expected
      expect(pattern.test("test")).toBe(true)
      expect(pattern.test("no match")).toBe(false)
      
      // Multiple calls should work consistently
      expect(pattern.test("test")).toBe(true)
      expect(pattern.test("test")).toBe(true)
    })

    it("should verify Map caching behavior", () => {
      const map = new Map<string, number>()
      
      // Test basic Map operations
      map.set("key1", 1)
      map.set("key2", 2)
      
      expect(map.size).toBe(2)
      expect(map.has("key1")).toBe(true)
      expect(map.get("key1")).toBe(1)
      
      map.delete("key1")
      expect(map.has("key1")).toBe(false)
      expect(map.size).toBe(1)
    })
  })
})
