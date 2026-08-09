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
      "sot343_p0.4451958904109589mm_rowspan1.999996mm_pl0.6999986mm_pw0.6999986mm_padoverride2_padoverridewidth0.8999982mm_padoverrideheight0.6999986mm_padoverridecenteroffsetx-0.14986mm_padoverridecenteroffsety0.000254mm_rounded0",
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
  expect((pads[1] as { y: number }).y).toBeCloseTo(-0.999744, 12)

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "sot343_c151520_parameters",
  )
})

test("sot343 padoverride selects a pad by pin number", () => {
  const pads = fp()
    .sot343()
    .padoverride(4)
    .padoverridewidth("0.64mm")
    .padoverrideheight("0.74mm")
    .padoverridecenteroffsetx("-0.344mm")
    .padoverridecenteroffsety("0.25mm")
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")

  expect(pads).toMatchObject([
    { port_hints: ["1"], width: 1.05, height: 0.45 },
    { port_hints: ["2"], width: 1.05, height: 0.45 },
    { port_hints: ["3"], width: 1.05, height: 0.45 },
    { port_hints: ["4"], x: -1.4, y: 0.9, width: 0.64, height: 0.74 },
  ])
})

test("sot343 rejects a padoverride pin outside its pin range", () => {
  expect(() =>
    fp.string("sot343_padoverride5_padoverridewidth1mm").circuitJson(),
  ).toThrow("pin number must be between 1 and 4")
})

test("sot343 pad override geometry requires a selected pin", () => {
  expect(() => fp.string("sot343_padoverridewidth1mm").circuitJson()).toThrow(
    "requires a 'padoverride' pin number",
  )
})
