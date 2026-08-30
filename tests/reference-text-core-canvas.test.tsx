import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { CircuitToCanvasDrawer } from "circuit-to-canvas"
import type { PcbSilkscreenText } from "circuit-json"
import { Circuit } from "tscircuit"
import { fp } from "../src/footprinter"
import { expectPngToMatchSnapshot } from "./fixtures/expect-png-to-match-snapshot"

const BOARD_WIDTH_MM = 30
const BOARD_HEIGHT_MM = 18
const CANVAS_WIDTH_PX = 1200
const CANVAS_HEIGHT_PX = 720
const COMPARISON_CANVAS_WIDTH_PX = CANVAS_WIDTH_PX * 2
const PREVIOUS_FOOTPRINTER_REFERENCE_FONT_SIZE_MM = 0.2
const PREVIOUS_RENDERED_REFERENCE_FONT_SIZE_MM = 0.4
const CURRENT_RENDERED_REFERENCE_FONT_SIZE_MM = 0.6

function getCurrentPreviewFootprintCircuitJson(footprintName: string) {
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

function getPreviewFootprintCircuitJson({
  footprintName,
  referenceFontSizeMm,
}: {
  footprintName: string
  referenceFontSizeMm?: number
}) {
  const footprintCircuitJson =
    getCurrentPreviewFootprintCircuitJson(footprintName)
  if (referenceFontSizeMm === undefined) {
    return footprintCircuitJson
  }

  return footprintCircuitJson.map((element) => {
    if (element.type !== "pcb_silkscreen_text") {
      return element
    }

    return { ...element, font_size: referenceFontSizeMm }
  })
}

async function renderReferenceTextCanvas({
  footprintReferenceFontSizeMm,
  renderedReferenceFontSizeMm,
}: {
  footprintReferenceFontSizeMm?: number
  renderedReferenceFontSizeMm: number
}) {
  const circuit = new Circuit({
    platform: {
      schematicDisabled: true,
      routingDisabled: true,
      footprintLibraryMap: {
        preview: async (footprintName) => ({
          footprintCircuitJson: getPreviewFootprintCircuitJson({
            footprintName,
            referenceFontSizeMm: footprintReferenceFontSizeMm,
          }),
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
  const referenceTexts = circuitJson.filter(
    (element): element is PcbSilkscreenText =>
      element.type === "pcb_silkscreen_text",
  )

  expect(referenceTexts).toHaveLength(8)
  for (const referenceText of referenceTexts) {
    expect(referenceText.font_size).toBeCloseTo(renderedReferenceFontSizeMm)
  }

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

  return canvas.toBuffer("image/png")
}

test("compare 0.4mm and 0.6mm reference text through Core and circuit-to-canvas", async () => {
  const previousReferenceTextPng = await renderReferenceTextCanvas({
    footprintReferenceFontSizeMm: PREVIOUS_FOOTPRINTER_REFERENCE_FONT_SIZE_MM,
    renderedReferenceFontSizeMm: PREVIOUS_RENDERED_REFERENCE_FONT_SIZE_MM,
  })
  const currentReferenceTextPng = await renderReferenceTextCanvas({
    renderedReferenceFontSizeMm: CURRENT_RENDERED_REFERENCE_FONT_SIZE_MM,
  })
  const previousReferenceTextImage = await loadImage(previousReferenceTextPng)
  const currentReferenceTextImage = await loadImage(currentReferenceTextPng)
  const comparisonCanvas = createCanvas(
    COMPARISON_CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
  )
  const comparisonCtx = comparisonCanvas.getContext("2d")
  comparisonCtx.drawImage(previousReferenceTextImage, 0, 0)
  comparisonCtx.drawImage(currentReferenceTextImage, CANVAS_WIDTH_PX, 0)

  await expectPngToMatchSnapshot({
    png: comparisonCanvas.toBuffer("image/png"),
    testPath: import.meta.path,
    snapshotName: "reference-text-core-canvas",
  })
})
