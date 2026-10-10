import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { lga_def } from "../src/fn/lga"

type LgaPad = Extract<PcbSmtPad, { shape: "rect" | "pill" }>
const padsOf = (recipe: string) =>
  fp
    .string(recipe)
    .circuitJson()
    .filter(
      (pad): pad is LgaPad =>
        pad.type === "pcb_smtpad" &&
        (pad.shape === "rect" || pad.shape === "pill"),
    )
const pinOf = (pads: LgaPad[], pin: number) =>
  pads.find((pad) => pad.port_hints?.includes(String(pin)))!

test("clockwise two-sided LGA matches BME280 top-view land numbering", () => {
  const recipe =
    "lga8_grid4x0_p0.65mm_w2.3mm_h2.3mm_pl0.35mm_pw0.35mm_cw_startingpin(rightside,toppin)"
  const pads = padsOf(recipe)
  const expected = [
    [0.975, 0.975],
    [0.975, 0.325],
    [0.975, -0.325],
    [0.975, -0.975],
    [-0.975, -0.975],
    [-0.975, -0.325],
    [-0.975, 0.325],
    [-0.975, 0.975],
  ]
  for (let i = 0; i < expected.length; i++) {
    const pad = pinOf(pads, i + 1)
    expect(pad.x).toBeCloseTo(expected[i]![0]!)
    expect(pad.y).toBeCloseTo(expected[i]![1]!)
  }
  const json = fp.string(recipe).circuitJson()
  const marker = json.find(
    (p) =>
      p.type === "pcb_silkscreen_path" &&
      p.pcb_silkscreen_path_id === "pin1_marker",
  )!
  if (marker.type !== "pcb_silkscreen_path") throw Error("Missing pin marker")
  expect(marker.route.every((p) => p.x > 0 && p.y > 0)).toBe(true)
  expect(convertCircuitJsonToPcbSvg(json)).toMatchSvgSnapshot(
    import.meta.path,
    "bme280-clockwise",
  )
})

test("LGA end pitch reproduces LIS3DH uneven corner gaps", () => {
  const recipe =
    "lga16_grid5x3_p0.5mm_lrendpitch0.725mm_w2.8mm_h2.8mm_pl0.35mm_pw0.25mm"
  const pads = padsOf(recipe)
  for (const [pin, x, y] of [
    [1, -1.225, 1.225],
    [2, -1.225, 0.5],
    [3, -1.225, 0],
    [4, -1.225, -0.5],
    [5, -1.225, -1.225],
    [6, -0.5, -1.225],
    [7, 0, -1.225],
    [8, 0.5, -1.225],
    [9, 1.225, -1.225],
    [13, 1.225, 1.225],
    [14, 0.5, 1.225],
    [16, -0.5, 1.225],
  ]) {
    expect(pinOf(pads, pin!).x).toBeCloseTo(x!)
    expect(pinOf(pads, pin!).y).toBeCloseTo(y!)
  }
  expect(
    convertCircuitJsonToPcbSvg(fp.string(recipe).circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "lis3dh-corner-gaps")
})

test("independent row pitches and end gaps preserve centered pad rows", () => {
  const recipe =
    "lga16_grid5x3_px0.7mm_py0.4mm_lrendpitch0.8mm_tbendpitch0.9mm_pl0.3mm_pw0.2mm"
  const pads = padsOf(recipe)
  for (const [i, y] of [1.2, 0.4, 0, -0.4, -1.2].entries())
    expect(pads[i]!.y).toBeCloseTo(y)
  expect(pinOf(pads, 6).x).toBeCloseTo(-0.9)
  expect(pinOf(pads, 8).x).toBeCloseTo(0.9)
  expect(
    convertCircuitJsonToPcbSvg(fp.string(recipe).circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "independent-row-pitches")
  expect(
    fp()
      .lga(16)
      .grid("5x3")
      .px(0.7)
      .py(0.4)
      .lrendpitch(0.8)
      .tbendpitch(0.9)
      .pl(0.3)
      .pw(0.2)
      .circuitJson(),
  ).toEqual(fp.string(recipe).circuitJson())
})

test("LGA rejects invalid row-pitch and numbering requests", () => {
  for (const key of ["px", "py", "lrendpitch", "tbendpitch"] as const)
    for (const value of [0, -1, Infinity, NaN, "bogus"]) {
      expect(() => lga_def.parse({ fn: "lga", [key]: value })).toThrow()
    }
  expect(() =>
    fp.string("lga8_grid4x0_startingpin(topside,leftpin)").circuitJson(),
  ).toThrow("has no pads")
  expect(() => fp.string("lga8_grid2x2_lrendpitch0.5mm").circuitJson()).toThrow(
    "at least three",
  )
  expect(() => fp.string("lga8_cw_ccw").circuitJson()).toThrow(
    "either cw or ccw",
  )
})
