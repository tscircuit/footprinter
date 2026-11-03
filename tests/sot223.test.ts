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
  const lowercaseHyphenSvg = convertCircuitJsonToPcbSvg(
    fp.string("sot223-5").circuitJson(),
  )
  const builderSvg = convertCircuitJsonToPcbSvg(fp().sot223(5).circuitJson())
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("sot223_5").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
  expect(lowercaseHyphenSvg).toEqual(canonicalSvg)
  expect(builderSvg).toEqual(canonicalSvg)
})
test("sot223_5 json parameters and custom pad dimensions", () => {
  const params = fp.string("sot223_5").json()
  expect(params.num_pins).toBe(5)
  expect(params.p).toBe("1.5mm")
  expect(params.pl).toBe("2.2mm")
  expect(params.pw).toBe("1mm")

  const customSoup = fp
    .string("sot223_5_p1.27mm_pl2.4mm_pw0.9mm_tabpl2mm_tabpw3.5mm")
    .circuitJson()
  const pads = customSoup.filter((el) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(5)
  const pin1 = pads.find(
    (p) => p.type === "pcb_smtpad" && p.port_hints?.includes("1"),
  )
  const pin5 = pads.find(
    (p) => p.type === "pcb_smtpad" && p.port_hints?.includes("5"),
  )
  expect(pin1 && "width" in pin1 ? pin1.width : 0).toBeCloseTo(2.4, 5)
  expect(pin1 && "height" in pin1 ? pin1.height : 0).toBeCloseTo(0.9, 5)
  expect(pin5 && "width" in pin5 ? pin5.width : 0).toBeCloseTo(2, 5)
  expect(pin5 && "height" in pin5 ? pin5.height : 0).toBeCloseTo(3.5, 5)
})
test("sot223_6", () => {
  const circuitJson = fp.string("sot223_6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot223_6")
})
