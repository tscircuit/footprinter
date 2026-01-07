import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("soj40_w18.3mm_p1.27mm", () => {
    const soup = fp.string("soj40_w18.3mm_p1.27mm").circuitJson()
    const svgContent = convertCircuitJsonToPcbSvg(soup)
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soj40_w18.3mm_p1.27mm")
})
