import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("dfn8_w5.3mm_p1.27mm", () => {
  const soup = fp.string("dfn8_w5.3mm_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dfn8_w5.3mm_p1.27mm")
})

test("dfn6 can omit its second nominal pad position", () => {
  const soup = fp
    .string("dfn6_w3.2mm_p0.95mm_pw0.6mm_pl1mm_missing(2)")
    .circuitJson()
  const pads = soup.filter(
    (element) => element.type === "pcb_smtpad" && element.shape === "rect",
  )

  expect(
    pads.map((pad) => ({
      x: pad.x,
      y: pad.y,
    })),
  ).toEqual([
    { x: -1.1, y: 0.95 },
    { x: -1.1, y: -0.95 },
    { x: 1.1, y: -0.95 },
    { x: 1.1, y: 0 },
    { x: 1.1, y: 0.95 },
  ])

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dfn6_missing2")
})
