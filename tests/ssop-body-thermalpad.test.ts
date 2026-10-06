import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("SSOP body courtyard encloses an offset thermal pad", () => {
  const elements = fp
    .string(
      "ssop28_p0.65mm_w8.93mm_bodywidth5.3mm_bodyheight10.2mm_thermalpad2x3_thermalpadcenteroffsetx5_thermalpadcenteroffsety4",
    )
    .circuitJson()
  const courtyard = elements.find((e) => e.type === "pcb_courtyard_outline")!
  if (courtyard.type !== "pcb_courtyard_outline")
    throw new Error("missing courtyard")
  expect(Math.max(...courtyard.outline.map((p) => p.x))).toBeCloseTo(6.25)
  expect(Math.max(...courtyard.outline.map((p) => p.y))).toBeCloseTo(5.75)
  expect(
    convertCircuitJsonToPcbSvg(elements, {
      showCourtyards: true,
      viewport: { minX: -7.25, maxX: 7.25, minY: -6.75, maxY: 6.75 },
    }),
  ).toMatchSvgSnapshot(import.meta.path, "ssop-body-offset-thermalpad")
})
