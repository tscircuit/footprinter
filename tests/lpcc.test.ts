import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("lpcc32 default 9x9mm 0.8mm-pitch footprint", () => {
  const circuitJson = fp.string("lpcc32").circuitJson()
  const pads = circuitJson.filter((el) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(32)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lpcc32")
})

test("lpcc-32 hyphenated alias and custom dimensions", () => {
  const aliasJson = fp.string("lpcc-32").circuitJson()
  expect(aliasJson.filter((el) => el.type === "pcb_smtpad")).toHaveLength(32)

  const customJson = fp.string("lpcc32_w5mm_p0.5mm").circuitJson()
  const customPads = customJson.filter((el) => el.type === "pcb_smtpad")
  expect(customPads).toHaveLength(32)

  const svgContent = convertCircuitJsonToPcbSvg(customJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lpcc32_w5mm_p0.5mm")
})
