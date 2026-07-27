import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot223_4", () => {
  const circuitJson = fp.string("sot223_4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot223_4")
})
test("sot223", () => {
  const circuitJson = fp.string("sot223").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot223")
})

test("sot223 supports independently sized and offset tab pads", () => {
  const circuitJson = fp
    .string(
      "sot223_w8.06mm_p2.3mm_pl2.5mm_pw1.1mm_tabpl2.34mm_tabpw3.6mm_taboffset0.08mm_pin1location(rightside,bottom)_rounded0",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot223_c6186")
})

test("sot223_5", () => {
  const circuitJson = fp.string("sot223_5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot223_5")
})
test("SOT-223-5 (alias)", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(
    fp.string("SOT-223-5").circuitJson(),
  )
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("sot223_5").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
})
test("sot223_6", () => {
  const circuitJson = fp.string("sot223_6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot223_6")
})
