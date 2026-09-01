import { expect } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import looksSame from "looks-same"

export const expectPngSnapshot = async ({
  png,
  snapshotName,
  testPath,
}: {
  png: Buffer
  snapshotName: string
  testPath: string
}) => {
  const snapshotDirectory = path.join(path.dirname(testPath), "__snapshots__")
  const snapshotPath = path.join(snapshotDirectory, `${snapshotName}.snap.png`)
  const shouldUpdateSnapshot =
    process.argv.includes("--update-snapshots") ||
    process.argv.includes("-u") ||
    Boolean(process.env.BUN_UPDATE_SNAPSHOTS)

  fs.mkdirSync(snapshotDirectory, { recursive: true })
  if (!fs.existsSync(snapshotPath) || shouldUpdateSnapshot) {
    fs.writeFileSync(snapshotPath, png)
  }

  const expectedPng = fs.readFileSync(snapshotPath)
  const comparison = await looksSame(expectedPng, png, {
    strict: false,
    tolerance: 5,
    antialiasingTolerance: 4,
  })

  expect(comparison.equal).toBe(true)
}
