import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("jst2_ph", () => {
  const circuitJson = fp.string("jst2_ph").circuitJson()
  const params = fp.string("jst2_ph").json() as any
  const platedHoles = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )

  expect(params).toMatchObject({ p: 2, id: 0.75, pw: 1.2, pl: 1.75 })
  expect(platedHoles).toMatchObject([
    {
      shape: "circular_hole_with_rect_pad",
      x: -1,
      y: 0,
      hole_diameter: 0.75,
      rect_pad_width: 1.2,
      rect_pad_height: 1.75,
      rect_border_radius: 0.125,
    },
    {
      shape: "pill",
      x: 1,
      y: 0,
      hole_width: 0.75,
      hole_height: 0.75,
      outer_width: 1.2,
      outer_height: 1.75,
    },
  ])

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst2_ph")
})

test("jst4_ph", () => {
  const circuitJson = fp.string("jst4_ph").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst4_ph")
})

test("jst10_ph", () => {
  const circuitJson = fp.string("jst10_ph").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst10_ph")
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

test("jst4_smd with mounting pads below the signal row", () => {
  const definition =
    "jst4_smd_p2mm_pw1mm_pl6mm_mpx10.698mm_mpy2.316mm_mpw1.8mm_mpl3.4mm"
  const circuitJson = fp.string(definition).circuitJson()
  const params = fp.string(definition).json() as any

  expect(params.num_pins).toBe(4)
  expect(params.smd).toBe(true)
  expect(params.mounttop).toBe(false)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path + "jst4_smd",
  )
})

test("jst5_smd_mounttop", () => {
  const definition =
    "jst5_smd_mounttop_p1.5mm_pw0.7mm_pl5mm_mpx10.1mm_mpy1.85mm_mpw1.5mm_mpl2.3mm"
  const circuitJson = fp.string(definition).circuitJson()
  const params = fp.string(definition).json() as any

  expect(params.num_pins).toBe(5)
  expect(params.smd).toBe(true)
  expect(params.mounttop).toBe(true)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path + "jst5_smd_mounttop",
  )
})

test("jst_sh6_is_invalid", () => {
  expect(() => fp.string("jst_sh6").json()).toThrow()
})

test("jst_without_num_pins_is_invalid", () => {
  expect(() => fp.string("jst_sh").json()).toThrow()
  expect(() => fp.string("jst_ph").json()).toThrow()
})

test("jst_ph parameter overrides throw on fixed-form geometry mismatch", () => {
  expect(() =>
    fp.string("jst4_ph_p2mm_w10.12mm_h4.72mm").circuitJson(),
  ).not.toThrow()

  expect(() => fp.string("jst4_ph_p2.54mm").circuitJson()).toThrow(
    /fixed-form at 2\.00mm pitch/,
  )
  expect(() => fp.string("jst4_ph_w12mm").circuitJson()).toThrow(
    /fixed-form at 2\.00mm pitch/,
  )
  expect(() => fp.string("jst4_ph_h6mm").circuitJson()).toThrow(
    /fixed-form at 2\.00mm pitch/,
  )
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

test("jst4_xh", () => {
  const circuitJson = fp.string("jst4_xh").circuitJson()
  const params = fp.string("jst4_xh").json() as any
  expect(params.num_pins).toBe(4)
  expect(params.xh).toBe(true)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst4_xh")
})

test("jst10_xh", () => {
  const circuitJson = fp.string("jst10_xh").circuitJson()
  const params = fp.string("jst10_xh").json() as any
  expect(params.num_pins).toBe(10)
  expect(params.xh).toBe(true)
  expect(params.id).toBe(0.95)
  expect(params.pl).toBe(1.95)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst10_xh")
})

test("jst_xh_4 (pretransform)", () => {
  const params = fp.string("jst_xh_4").json() as any
  expect(params.num_pins).toBe(4)
  expect(params.xh).toBe(true)
})
