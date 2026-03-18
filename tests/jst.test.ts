import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("jst2_ph", () => {
  const circuitJson = fp.string("jst2_ph").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst2_ph")
})

test("jst4_sh", () => {
  const circuitJson = fp.string("jst4_sh").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst4_sh")
})

test("jst8_sh", () => {
  const circuitJson = fp.string("jst8_sh").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst8_sh")
})
test("jst2_sh", () => {
  const circuitJson = fp.string("jst2_sh").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst2_sh")
})

test("jst6_sh", () => {
  const circuitJson = fp.string("jst6_sh").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst6_sh")
})

test("jst_ph_4 generates 4 pads", () => {
  const circuitJson = fp.string("jst_ph_4").circuitJson()
  const pads = circuitJson.filter((el: any) => el.type === "pcb_plated_hole")
  expect(pads).toHaveLength(4)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_ph_4")
})

test("jst_sh_6 generates 6 signal pads", () => {
  const circuitJson = fp.string("jst_sh_6").circuitJson()
  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  // 6 signal pads + 2 mounting pads
  expect(pads).toHaveLength(8)
})

test("jst_sh6_is_invalid", () => {
  expect(() => fp.string("jst_sh6").json()).toThrow()
})

test("jst_without_num_pins_is_invalid", () => {
  expect(() => fp.string("jst_sh").json()).toThrow()
  expect(() => fp.string("jst_ph").json()).toThrow()
})

test("jst_ph_4 (pretransform)", () => {
  const circuitJson = fp.string("jst_ph_4").circuitJson()
  const params = fp.string("jst_ph_4").json() as any
  expect(params.num_pins).toBe(4)
  expect(params.ph).toBe(true)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_ph_4")
})

test("jst_sh_6 (pretransform)", () => {
  const circuitJson = fp.string("jst_sh_6").circuitJson()
  const params = fp.string("jst_sh_6").json() as any
  expect(params.num_pins).toBe(6)
  expect(params.sh).toBe(true)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_sh_6")
})

test("jst_zh_2 (pretransform)", () => {
  const circuitJson = fp.string("jst_zh_2").circuitJson()
  const params = fp.string("jst_zh_2").json() as any
  expect(params.num_pins).toBe(2)
  expect(params.zh).toBe(true)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_zh_2")
})
