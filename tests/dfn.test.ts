import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("dfn8_w5.3mm_p1.27mm", () => {
  const soup = fp.string("dfn8_w5.3mm_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dfn8_w5.3mm_p1.27mm")
})

test("dfn8_pillpads", () => {
  const soup = fp.string("dfn8_w5.3mm_p1.27mm_pillpads").circuitJson()
  const pads = soup.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(8)
  expect(pads.every((pad) => pad.shape === "pill")).toBe(true)
  expect(
    pads.every((pad) => pad.radius === Math.min(pad.width, pad.height) / 2),
  ).toBe(true)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dfn8_pillpads")
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

test("dfn thermal pad supports a configurable via grid", () => {
  const soup = fp
    .string(
      "dfn8_w5.3mm_p1.27mm_thermalpad2.4x3mm_thermalvias2x3_thermalviapitch0.8mm_thermalviaid0.25mm_thermalviaod0.5mm",
    )
    .circuitJson()
  const vias = soup.filter((element) => element.type === "pcb_via")

  expect(vias).toHaveLength(6)
  expect(vias.map(({ x, y }) => [x, y])).toEqual(
    [-0.8, 0, 0.8].flatMap((y) => [-0.4, 0.4].map((x) => [x, y])),
  )
  expect(
    vias.every(
      (via) =>
        via.hole_diameter === 0.25 &&
        via.outer_diameter === 0.5 &&
        via.layers[0] === "top" &&
        via.layers[1] === "bottom",
    ),
  ).toBe(true)

  expect(convertCircuitJsonToPcbSvg(soup)).toMatchSvgSnapshot(
    import.meta.path,
    "dfn8_thermalpad_2x3_thermalvias",
  )
})
