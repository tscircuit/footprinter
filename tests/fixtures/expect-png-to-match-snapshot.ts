import { expect } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import fs from "node:fs"
import path from "node:path"

const MAX_CHANNEL_DIFFERENCE = 20
const MAX_DIFFERING_PIXEL_RATIO = 0.01

export async function expectPngToMatchSnapshot({
  png,
  testPath,
  snapshotName,
}: {
  png: Buffer
  testPath: string
  snapshotName: string
}) {
  const snapshotDir = path.join(path.dirname(testPath), "__snapshots__")
  const snapshotPath = path.join(snapshotDir, `${snapshotName}.snap.png`)
  const shouldUpdateSnapshot =
    process.argv.includes("--update-snapshots") ||
    process.argv.includes("-u") ||
    Boolean(process.env.BUN_UPDATE_SNAPSHOTS)

  if (!fs.existsSync(snapshotPath) || shouldUpdateSnapshot) {
    fs.mkdirSync(snapshotDir, { recursive: true })
    fs.writeFileSync(snapshotPath, png)
    return
  }

  const expectedImage = await loadImage(fs.readFileSync(snapshotPath))
  const receivedImage = await loadImage(png)
  expect(receivedImage.width).toBe(expectedImage.width)
  expect(receivedImage.height).toBe(expectedImage.height)

  const expectedCanvas = createCanvas(expectedImage.width, expectedImage.height)
  const expectedCtx = expectedCanvas.getContext("2d")
  expectedCtx.drawImage(expectedImage, 0, 0)
  const expectedPixels = expectedCtx.getImageData(
    0,
    0,
    expectedImage.width,
    expectedImage.height,
  ).data

  const receivedCanvas = createCanvas(receivedImage.width, receivedImage.height)
  const receivedCtx = receivedCanvas.getContext("2d")
  receivedCtx.drawImage(receivedImage, 0, 0)
  const receivedPixels = receivedCtx.getImageData(
    0,
    0,
    receivedImage.width,
    receivedImage.height,
  ).data

  let differingPixels = 0
  for (
    let channelIndex = 0;
    channelIndex < expectedPixels.length;
    channelIndex += 4
  ) {
    const redDifference = Math.abs(
      expectedPixels[channelIndex]! - receivedPixels[channelIndex]!,
    )
    const greenDifference = Math.abs(
      expectedPixels[channelIndex + 1]! - receivedPixels[channelIndex + 1]!,
    )
    const blueDifference = Math.abs(
      expectedPixels[channelIndex + 2]! - receivedPixels[channelIndex + 2]!,
    )
    const alphaDifference = Math.abs(
      expectedPixels[channelIndex + 3]! - receivedPixels[channelIndex + 3]!,
    )

    if (
      Math.max(
        redDifference,
        greenDifference,
        blueDifference,
        alphaDifference,
      ) > MAX_CHANNEL_DIFFERENCE
    ) {
      differingPixels += 1
    }
  }

  const totalPixels = expectedImage.width * expectedImage.height
  expect(differingPixels / totalPixels).toBeLessThanOrEqual(
    MAX_DIFFERING_PIXEL_RATIO,
  )
}
