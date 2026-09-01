import { test } from "bun:test"
import { createCanvas } from "@napi-rs/canvas"
import type { Bounds } from "@tscircuit/math-utils"
import type { AnyCircuitElement } from "circuit-json"
import { CircuitToCanvasDrawer } from "circuit-to-canvas"
import { fp } from "../src/footprinter"
import { expectPngSnapshot } from "./fixtures/expect-png-snapshot"

const SNAPSHOT_WIDTH_PX = 680
const SNAPSHOT_HEIGHT_PX = 540

const renderFootprintToPng = ({
  circuitJson,
  viewport,
}: {
  circuitJson: AnyCircuitElement[]
  viewport: Bounds
}) => {
  const canvas = createCanvas(SNAPSHOT_WIDTH_PX, SNAPSHOT_HEIGHT_PX)
  const context = canvas.getContext("2d")
  const drawer = new CircuitToCanvasDrawer(context)

  context.fillStyle = "#111111"
  context.fillRect(0, 0, canvas.width, canvas.height)
  drawer.setCameraBounds(viewport)
  drawer.drawElements(
    circuitJson.filter((element) => !element.type.startsWith("pcb_courtyard")),
  )

  return canvas.toBuffer("image/png")
}

const referenceTextCases: Array<{ footprint: string; viewport: Bounds }> = [
  {
    footprint: "0402",
    viewport: { minX: -1.7, minY: -1.1, maxX: 1.7, maxY: 1.6 },
  },
  {
    footprint: "0603",
    viewport: { minX: -2, minY: -1.3, maxX: 2, maxY: 1.9 },
  },
  {
    footprint: "0402_x2",
    viewport: { minX: -1.7, minY: -1.4, maxX: 1.7, maxY: 1.8 },
  },
]

for (const referenceTextCase of referenceTextCases) {
  test(`${referenceTextCase.footprint} reference text canvas snapshot`, async () => {
    const circuitJson = fp.string(referenceTextCase.footprint).circuitJson()
    const png = renderFootprintToPng({
      circuitJson,
      viewport: referenceTextCase.viewport,
    })

    await expectPngSnapshot({
      png,
      snapshotName: `${referenceTextCase.footprint}_canvas`,
      testPath: import.meta.path,
    })
  })
}
