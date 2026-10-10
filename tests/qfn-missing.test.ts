import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { qfn, qfn_def } from "../src/fn/qfn"
import { any_footprinter_def } from "../src/helpers/zod/AnyFootprinterDefinitionOutput"
import source from "./fixtures/aqfn73-nrf52840-source.json"

const missing = "A2,A4,A6,E1,AA1,AC1,C24,G24,B21,AC3,AC7,V2,K23,M23,AB23"
const recipe = `qfn88_grid12x12_rows2_staggered_p0.5mm_rowspan6.5mm_rowgap0.5mm_circularpads_pw0.35mm_w7mm_h7mm_thermalpad4.85x4.85mm_pinnumbering(ballcoords)_missing(${missing})`
const padsOf = (definition: string) =>
  fp
    .string(definition)
    .circuitJson()
    .filter((element): element is PcbSmtPad => element.type === "pcb_smtpad")

test("two-row QFN missing sites reproduce all Nordic aQFN73 physical terminals", () => {
  const pads = padsOf(recipe)
  expect(pads).toHaveLength(74)
  expect(new Set(pads.map((pad) => pad.port_hints?.[0])).size).toBe(74)
  expect(pads.map((pad) => pad.port_hints?.[0]).sort()).toEqual(
    source.expectedCopper.map((pad) => pad.pin).sort(),
  )
  expect(
    pads
      .flatMap((pad) => pad.port_hints ?? [])
      .some((pin) => /^\d+$/.test(pin)),
  ).toBe(false)
  for (const expected of source.expectedCopper) {
    const actual = pads.find((pad) => pad.port_hints?.[0] === expected.pin)!
    expect(actual.layer).toBe("top")
    if ("radius" in expected) {
      expect(actual.shape).toBe("circle")
      if (actual.shape !== "circle")
        throw Error(`Expected circle ${expected.pin}`)
      expect(actual.x).toBeCloseTo(expected.x, 10)
      expect(actual.y).toBeCloseTo(expected.y, 10)
      expect(actual.radius).toBeCloseTo(expected.radius!, 10)
      expect(actual.port_hints).toEqual([expected.pin])
    } else {
      expect(actual.shape).toBe("rect")
      if (actual.shape !== "rect") throw Error("Expected exposed pad rectangle")
      expect(actual.x).toBe(0)
      expect(actual.y).toBe(0)
      expect(actual.width).toBe(expected.width!)
      expect(actual.height).toBe(expected.height!)
      expect(actual.port_hints).toEqual(["EP", "thermalpad"])
    }
  }
  expect(
    pads.filter((pad) => pad.port_hints?.includes("thermalpad")),
  ).toHaveLength(1)
  expect(
    convertCircuitJsonToPcbSvg(fp.string(recipe).circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "qfn-nrf52840-missing")
})

test("QFN shared schema and parsed-definition roundtrip retain nominal count and all new parameters", () => {
  const parsed = qfn_def.parse(fp.string(recipe).params())
  expect(parsed).toMatchObject({
    fn: "qfn",
    num_pins: 88,
    rows: 2,
    grid: { x: 12, y: 12 },
    p: 0.5,
    rowgap: 0.5,
    rowspan: 6.5,
    circularpads: true,
    staggered: true,
    pinnumbering: "ballcoords",
    missing: missing.split(","),
  })
  expect(fp.string(recipe).json()).toEqual(parsed)
  expect(any_footprinter_def.parse(fp.string(recipe).params())).toEqual(parsed)
  expect(any_footprinter_def.parse({ fn: "axial", num_pins: 2 })).toMatchObject(
    {
      fn: "axial",
    },
  )
  expect(() => qfn_def.parse({ fn: "axial" })).toThrow()
  expect(qfn_def.safeParse({ fn: "bga", grid: "3x3" }).success).toBe(false)
  expect(qfn(parsed).circuitJson).toEqual(fp.string(recipe).circuitJson())
  const restored = qfn(JSON.parse(JSON.stringify(parsed)))
  expect(restored.parameters.num_pins).toBe(88)
  expect(restored.parameters.missing).toHaveLength(15)
  expect(restored.circuitJson).toEqual(fp.string(recipe).circuitJson())
  const vias = `${recipe}_thermalvias2x2_thermalpadcenteroffsetx0.1mm_thermalpadcenteroffsety-0.1mm`
  const withVias = qfn_def.parse(fp.string(vias).params())
  expect(qfn(withVias).circuitJson).toEqual(fp.string(vias).circuitJson())
  expect(
    fp()
      .qfn(88)
      .grid("12x12")
      .rows(2)
      .staggered()
      .p("500um")
      .rowspan("6500um")
      .rowgap("500um")
      .circularpads()
      .pw("350um")
      .w("7000um")
      .h("7000um")
      .thermalpad("4.85x4.85mm")
      .pinnumbering("ballcoords")
      .missing(`(${missing})`)
      .circuitJson(),
  ).toEqual(restored.circuitJson)
})

test("ordinary single-row missing QFN preserves each surviving nominal pin and existing geometry", () => {
  const original = padsOf("qfn16_grid4x4_thermalpad1.5x1.5mm")
  const sparse = padsOf("qfn16_grid4x4_thermalpad1.5x1.5mm_missing(2,7)")
  expect(sparse).toHaveLength(15)
  expect(sparse).toEqual(
    original.filter((pad) => !["2", "7"].includes(pad.port_hints?.[0] ?? "")),
  )
  const parsed = qfn_def.parse(
    fp.string("qfn16_grid4x4_thermalpad1.5x1.5mm_missing(2,7)").params(),
  )
  expect(parsed.num_pins).toBe(16)
  expect(qfn(parsed).circuitJson).toEqual(
    fp.string("qfn16_grid4x4_thermalpad1.5x1.5mm_missing(2,7)").circuitJson(),
  )
  expect(
    convertCircuitJsonToPcbSvg(
      fp.string("qfn16_grid4x4_thermalpad1.5x1.5mm_missing(2,7)").circuitJson(),
    ),
  ).toMatchSvgSnapshot(import.meta.path, "qfn-single-row-missing")
})

test("unrelated rectangular two-row QFN supports uniform pads and numeric missing sites without renumbering", () => {
  const base =
    "qfn48_grid8x6_rows2_staggered_p0.5mm_rowspan4mm_rowgap0.5mm_w5.4mm_h4.4mm_pw0.25mm_pl0.35mm"
  const original = padsOf(base)
  const sparse = padsOf(`${base}_missing(3,47)`)
  expect(original).toHaveLength(48)
  expect(sparse).toHaveLength(46)
  expect(sparse).toEqual(
    original.filter((pad) => !["3", "47"].includes(pad.port_hints?.[0] ?? "")),
  )
  const left1 = original.find((pad) => pad.port_hints?.[0] === "1")!
  const innerLeft1 = original.find((pad) => pad.port_hints?.[0] === "29")!
  if (left1.shape !== "rect" || innerLeft1.shape !== "rect")
    throw Error("Expected rectangular lands")
  expect(left1.x).toBe(-2)
  expect(left1.y).toBe(1.25)
  expect(innerLeft1.x).toBe(-1.5)
  expect(innerLeft1.y).toBe(0.5)
  expect(left1.width).toBe(0.35)
  expect(left1.height).toBe(0.25)
  const labelled = padsOf(`${base}_pinnumbering(ballcoords)`)
  expect(new Set(labelled.map((pad) => pad.port_hints?.[0])).size).toBe(48)
  expect(labelled.find((pad) => pad.port_hints?.[0] === "A15")).toBeDefined()
  expect(labelled.find((pad) => pad.port_hints?.[0] === "B1")).toBeDefined()
  expect(labelled.find((pad) => pad.port_hints?.[0] === "D2")).toBeDefined()
  expect(
    convertCircuitJsonToPcbSvg(
      fp.string(`${base}_missing(3,47)`).circuitJson(),
    ),
  ).toMatchSvgSnapshot(import.meta.path, "qfn-rectangular-two-row-missing")
})

test("two-row QFN scaled dimensions preserve the source sites", () => {
  const scaled = recipe
    .replace("p0.5mm", "p0.6mm")
    .replace("rowspan6.5mm", "rowspan7.8mm")
    .replace("rowgap0.5mm", "rowgap0.6mm")
    .replace("pw0.35mm", "pw0.4mm")
    .replace("w7mm_h7mm", "w8.4mm_h8.6mm")
    .replace("4.85x4.85mm", "5.8x5.8mm")
  for (const expected of source.expectedCopper) {
    const actual = padsOf(scaled).find(
      (pad) => pad.port_hints?.[0] === expected.pin,
    )!
    if (actual.shape !== "circle" && actual.shape !== "rect")
      throw Error("Unexpected pad shape")
    expect(actual.x).toBeCloseTo(expected.x * 1.2, 10)
    expect(actual.y).toBeCloseTo(expected.y * 1.2, 10)
    if (actual.shape === "circle") expect(actual.radius).toBe(0.2)
    else expect(actual.width).toBe(5.8)
  }
  expect(
    convertCircuitJsonToPcbSvg(fp.string(scaled).circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "qfn-nrf52840-scaled")
})

test("generic rectangular QFN row staggering uses independent horizontal and vertical pitches", () => {
  const base =
    "qfn48_grid8x6_rows2_p0.5mm_px0.6mm_py0.4mm_rowspan4mm_rowgap0.5mm_w5.4mm_h4.4mm_pw0.2mm_pl0.3mm_pinnumbering(ballcoords)"
  const ordinary = padsOf(base)
  const staggered = padsOf(`${base}_staggered`)
  const positions = (pads: PcbSmtPad[], pin: string) => {
    const pad = pads.find((pad) => pad.port_hints?.[0] === pin)!
    if (pad.shape !== "rect") throw Error("Expected rectangular land")
    return [pad.x, pad.y]
  }
  expect(positions(ordinary, "C2")[0]).toBe(-1.5)
  expect(positions(ordinary, "C2")[1]).toBeCloseTo(0.6, 10)
  expect(positions(staggered, "D2")[0]).toBe(-1.5)
  expect(positions(staggered, "D2")[1]).toBeCloseTo(0.4, 10)
  expect(positions(ordinary, "B4")).toEqual([-1.5, 1.5])
  expect(positions(staggered, "B3")[0]).toBeCloseTo(-1.8, 10)
  expect(positions(staggered, "B3")[1]).toBe(1.5)
  const automatic = fp.string("qfn48_grid8x6_rows2_px1mm_py0.4mm")
  const parameters = qfn_def.parse(automatic.params())
  expect(parameters.w).toBe(10)
  expect(parameters.h).toBe(3.2)
  expect(parameters.pw).toBe(0.2)
  expect(parameters.pl).toBe(0.2)
  expect(padsOf("qfn48_grid8x6_rows2_px1mm_py0.4mm")).toHaveLength(48)
  expect(padsOf("qfn88_grid12x12_rows2")).toHaveLength(88)
  for (const [name, definition] of [
    ["ordinary", base],
    ["staggered", `${base}_staggered`],
    ["automatic-body", "qfn48_grid8x6_rows2_px1mm_py0.4mm"],
    ["default-square", "qfn88_grid12x12_rows2"],
  ])
    expect(
      convertCircuitJsonToPcbSvg(fp.string(definition!).circuitJson()),
    ).toMatchSvgSnapshot(
      import.meta.path,
      `qfn-rectangular-${name}-independent-pitches`,
    )
})

test("QFN missing and new row options reject invalid sites, numbering, sizes, and collisions", () => {
  for (const suffix of [
    "missing(A1)",
    "missing(EP)",
    "missing(89)",
    "missing(1.5)",
    "missing(A2,A2)",
    "missing(A2,48)",
    "rows3",
    "grid8x8",
    "rowgap0mm",
    "rowgap4mm",
    "rowspan8mm",
    "pw0.6mm",
    "thermalpad5.2x5.2mm",
    "pinnumbering(rowmajor)",
    "pillpads",
  ]) {
    // Override the reviewed recipe's missing list before exercising a bad one.
    const base = recipe.replace(/_missing\([^)]*\)$/, "")
    expect(() => fp.string(`${base}_${suffix}`).circuitJson()).toThrow()
  }
  for (const field of [
    "p",
    "px",
    "py",
    "pw",
    "pl",
    "w",
    "h",
    "rowgap",
    "rowspan",
  ])
    for (const value of [0, -1, Infinity, NaN]) {
      const raw = fp.string(recipe).params()
      expect(() => qfn({ ...raw, [field]: value })).toThrow()
    }
  for (const option of ["cc", "ccw"])
    expect(() =>
      qfn({ ...fp.string(recipe).params(), [option]: false }),
    ).toThrow("counterclockwise")
  for (const option of [
    "lrpw",
    "lrpl",
    "leftrightpadwidth",
    "leftrightpadlength",
  ])
    expect(() => qfn({ ...fp.string(recipe).params(), [option]: 0 })).toThrow()
  expect(() => fp.string("qfn16_staggered").circuitJson()).toThrow("rows2")
  expect(() =>
    fp.string("qfn16_circularpads_pw0.3mm_lrpw0.4mm_lrpl0.4mm").circuitJson(),
  ).toThrow("overrides")
  expect(() =>
    fp.string(`${recipe}_pin1location(leftside,top)`).circuitJson(),
  ).toThrow('port_hints contain "1" or "pin1"')
})
