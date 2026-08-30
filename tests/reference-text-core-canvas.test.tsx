import { test } from "bun:test"
import { createCanvas } from "@napi-rs/canvas"
import { Circuit } from "@tscircuit/core"
import { CircuitToCanvasDrawer } from "circuit-to-canvas"
import { fp } from "../src/footprinter"
import { expectPngToMatchSnapshot } from "./fixtures/expect-png-to-match-snapshot"

const BOARD_WIDTH_MM = 30
const BOARD_HEIGHT_MM = 18
const CANVAS_WIDTH_PX = 1200
const CANVAS_HEIGHT_PX = 720

function getPreviewFootprintCircuitJson(footprintName: string) {
  switch (footprintName) {
    case "0402":
    case "0603":
    case "0402_x4":
    case "sot723":
    case "platedhole_d1.2":
      return fp.string(footprintName).circuitJson()
    case "bga_3x3":
      return fp()
        .bga(8)
        .w("4mm")
        .h("4mm")
        .grid("3x3")
        .missing("center")
        .p(1)
        .circuitJson()
    case "pad_2x1":
      return fp().pad().w(2).h(1).circuitJson()
    case "smtpad_1.2":
      return fp().smtpad().circle().d("1.2mm").circuitJson()
  }

  throw new Error(`Unknown preview footprint: ${footprintName}`)
}

test("render 0.6mm reference text through Core and circuit-to-canvas", async () => {
  const circuit = new Circuit({
    platform: {
      schematicDisabled: true,
      routingDisabled: true,
      footprintLibraryMap: {
        preview: async (footprintName) => ({
          footprintCircuitJson: getPreviewFootprintCircuitJson(footprintName),
        }),
      },
    },
  })

  circuit.add(
    <board width={BOARD_WIDTH_MM} height={BOARD_HEIGHT_MM}>
      <resistor
        name="R1"
        resistance="1k"
        footprint="preview:0402"
        pcbX={-11}
        pcbY={4}
      />
      <resistor
        name="R2"
        resistance="1k"
        footprint="preview:0603"
        pcbX={-4}
        pcbY={4}
      />
      <chip name="RN1" footprint="preview:0402_x4" pcbX={3} pcbY={4} />
      <chip name="U1" footprint="preview:bga_3x3" pcbX={10} pcbY={4} />
      <chip name="Q1" footprint="preview:sot723" pcbX={-11} pcbY={-4} />
      <chip name="TP1" footprint="preview:pad_2x1" pcbX={-4} pcbY={-4} />
      <chip name="H1" footprint="preview:platedhole_d1.2" pcbX={3} pcbY={-4} />
      <chip name="TP2" footprint="preview:smtpad_1.2" pcbX={10} pcbY={-4} />
    </board>,
  )

  await circuit.renderUntilSettled()
  const circuitJson = circuit.getCircuitJson()

  const canvas = createCanvas(CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX)
  const ctx = canvas.getContext("2d")
  const drawer = new CircuitToCanvasDrawer(ctx)
  ctx.fillStyle = "#1a1a1a"
  ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX)
  drawer.setCameraBounds({
    minX: -BOARD_WIDTH_MM / 2,
    maxX: BOARD_WIDTH_MM / 2,
    minY: -BOARD_HEIGHT_MM / 2,
    maxY: BOARD_HEIGHT_MM / 2,
  })
  drawer.drawElements(circuitJson, {
    drawBoardMaterial: true,
    drawSoldermask: true,
    layers: ["top_copper", "top_silkscreen"],
  })

  await expectPngToMatchSnapshot({
    png: canvas.toBuffer("image/png"),
    testPath: import.meta.path,
    snapshotName: "reference-text-core-canvas",
  })
})
