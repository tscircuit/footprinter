import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot343", () => {
  const circuitJson = fp.string("sot343").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot343")
})

test("sot343_pl1.2_pw0.9_p2_w5.2_h5", () => {
  const circuitJson = fp.string("sot343_pl1.2_pw0.9_p2_w5.2_h5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot343_pl1.2_pw0.9_p2_w5.2_h5",
  )
})

test("sot343 parameters reproduce C151520", () => {
  const circuitJson = fp
    .string(
      "sot343_p0.4451958904109589mm_rowspan1.999996mm_pl0.6999986mm_pw0.6999986mm_p2w0.8999982mm_p2x0.2953358904109589mm_p2y-0.999744mm_rounded0",
    )
    .circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(4)
  expect(pads).toMatchObject([
    {
      port_hints: ["1"],
      x: -0.854776109589041,
      y: -0.999998,
      width: 0.6999986,
      height: 0.6999986,
    },
    {
      port_hints: ["2"],
      x: 0.2953358904109589,
      y: -0.999744,
      width: 0.8999982,
      height: 0.6999986,
    },
    {
      port_hints: ["3"],
      x: 0.4451958904109589,
      y: 0.999998,
      width: 0.6999986,
      height: 0.6999986,
    },
    {
      port_hints: ["4"],
      x: -0.854776109589041,
      y: 0.999998,
      width: 0.6999986,
      height: 0.6999986,
    },
  ])

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "sot343_c151520_parameters",
  )
})

test("sot343 supports width, height, and center overrides for every pad", () => {
  const pads = fp
    .string(
      "sot343_p1w0.61mm_p1h0.71mm_p1x-1.1mm_p1y-0.9mm_p2w0.62mm_p2h0.72mm_p2x1.2mm_p2y-0.8mm_p3w0.63mm_p3h0.73mm_p3x1.3mm_p3y0.8mm_p4w0.64mm_p4h0.74mm_p4x-1.4mm_p4y0.9mm",
    )
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")

  expect(pads).toMatchObject([
    { port_hints: ["1"], x: -1.1, y: -0.9, width: 0.61, height: 0.71 },
    { port_hints: ["2"], x: 1.2, y: -0.8, width: 0.62, height: 0.72 },
    { port_hints: ["3"], x: 1.3, y: 0.8, width: 0.63, height: 0.73 },
    { port_hints: ["4"], x: -1.4, y: 0.9, width: 0.64, height: 0.74 },
  ])
})
