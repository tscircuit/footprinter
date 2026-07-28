import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getPadGeometry = (footprint: string) =>
  fp
    .string(footprint)
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")
    .map(({ x, y, width, height, port_hints }) => ({
      x,
      y,
      width,
      height,
      port_hints,
    }))

test("smtpadpair supports independently sized pads", () => {
  const footprint = "smtpadpair_px2.1mm_p1w2mm_p1h1mm_p2w1.2mm_p2h1mm"
  const circuitJson = fp.string(footprint).circuitJson()

  expect(getPadGeometry(footprint)).toEqual([
    { x: -1.05, y: 0, width: 2, height: 1, port_hints: ["1"] },
    { x: 1.05, y: 0, width: 1.2, height: 1, port_hints: ["2"] },
  ])
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "asymmetric",
  )
})

test("smtpadpair supports a signed vertical pad offset", () => {
  const footprint =
    "smtpadpair_px13.45mm_py-2.54mm_p1w2.5mm_p1h2.55mm_p2w2.5mm_p2h2.55mm"
  const circuitJson = fp.string(footprint).circuitJson()

  expect(getPadGeometry(footprint)).toEqual([
    { x: -6.725, y: 1.27, width: 2.5, height: 2.55, port_hints: ["1"] },
    { x: 6.725, y: -1.27, width: 2.5, height: 2.55, port_hints: ["2"] },
  ])
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "staggered",
  )
})

test("smtpadpair rejects coincident pads", () => {
  expect(() => fp.string("smtpadpair_px0mm_py0mm").circuitJson()).toThrow(
    "non-zero center offset",
  )
})
