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

test("jst_ph silkscreen scales dynamically with pin count", () => {
  const circuitJson2 = fp.string("jst2_ph").circuitJson()
  const circuitJson4 = fp.string("jst_ph_4").circuitJson()

  const silkscreen2 = circuitJson2.find(
    (x: any) => x.type === "pcb_silkscreen_path",
  ) as any
  const silkscreen4 = circuitJson4.find(
    (x: any) => x.type === "pcb_silkscreen_path",
  ) as any

  expect(silkscreen2).toBeDefined()
  expect(silkscreen4).toBeDefined()

  const xs2 = silkscreen2.route.map((p: any) => p.x)
  const xs4 = silkscreen4.route.map((p: any) => p.x)

  const width2 = Math.max(...xs2) - Math.min(...xs2)
  const width4 = Math.max(...xs4) - Math.min(...xs4)

  // 2-pin width should be exactly 6mm (or very close: 2.2 + 3.8 = 6.0)
  expect(width2).toBeCloseTo(6.0, 1)

  // 4-pin width should be exactly 10.4mm (3 * 2.2 + 3.8 = 10.4)
  expect(width4).toBeCloseTo(10.4, 1)

  // 4-pin should be wider than 2-pin
  expect(width4).toBeGreaterThan(width2)
})
