import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("dip28_w7.62mm_p2.54mm", () => {
  const circuitJson = fp
    .string("dip28_w7.62mm_p2.54mm")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "dip28_w7.62mm_p2.54mm",
  )
})
