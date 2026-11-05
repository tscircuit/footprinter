import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("pushbutton", () => {
  const circuitJson = fp.string("pushbutton").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pushbutton")
})

test("pushbutton honors explicit outer diameter (od)", () => {
  const circuitJson = fp.string("pushbutton_id1mm_od2.2mm").circuitJson()
  const holes = circuitJson.filter(
    (e): e is Extract<typeof e, { type: "pcb_plated_hole" }> =>
      e.type === "pcb_plated_hole",
  )
  expect(holes).toHaveLength(4)
  for (const hole of holes) {
    if ("outer_diameter" in hole) {
      expect(hole.outer_diameter).toBeCloseTo(2.2)
    }
  }
})
