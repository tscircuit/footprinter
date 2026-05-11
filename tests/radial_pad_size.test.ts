import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("radial polarized p7.5 pad size matches KiCad CP_Radial", () => {
  const circuitJson = fp.string("radial_p7.5_polarized").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  // KiCad CP_Radial_D10.0mm_P7.50mm uses outer_diameter=2, hole_diameter=1
  expect(holes.length).toBe(2)
  for (const hole of holes as any[]) {
    expect(hole.outer_diameter).toBe(2)
    expect(hole.hole_diameter).toBe(1)
  }
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "radial_p7.5_polarized",
  )
})
