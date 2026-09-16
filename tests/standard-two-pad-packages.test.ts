import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const padsOf = (footprint: string) =>
  fp
    .string(footprint)
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")

test("do219ad identifies the package without changing its established land pattern", () => {
  const parameters = fp.string("do219ad").json()
  const pads = padsOf("do219ad")
  const genericPads = padsOf("smdpads2_p1.84mm_pw1.35mm_ph0.95mm")

  expect(parameters).toMatchObject({
    fn: "do219ad",
    num_pins: 2,
    cathodepin: 1,
    anodepin: 2,
    bodylength: 2.2,
    bodywidth: 1.3,
    bodyheight: 0.68,
  })
  expect(parameters).not.toHaveProperty("do219ad")
  expect(parameters).not.toHaveProperty("string")
  expect(pads).toEqual(genericPads)

  expect(
    convertCircuitJsonToPcbSvg(fp.string("do219ad").circuitJson(), {
      showCourtyards: true,
    }),
  ).toMatchSvgSnapshot(import.meta.path, "do219ad")
})

test("sod323he identifies the package without changing its established land pattern", () => {
  const parameters = fp.string("sod-323he").json()
  const pads = padsOf("sod323he")
  const genericPads = padsOf("smdpads2_p2.1001mm_pw0.8mm_ph1.1mm")

  expect(parameters).toMatchObject({
    fn: "sod323he",
    num_pins: 2,
    cathodepin: 1,
    anodepin: 2,
    bodylength: 2,
    bodywidth: 1.4,
    bodyheight: 0.6,
  })
  expect(pads).toEqual(genericPads)

  expect(
    convertCircuitJsonToPcbSvg(fp.string("sod323he").circuitJson(), {
      showCourtyards: true,
    }),
  ).toMatchSvgSnapshot(import.meta.path, "sod323he")
})

test("hyphenated standard package aliases normalize to canonical identities", () => {
  expect(fp.string("DO-219AD").json().fn).toBe("do219ad")
  expect(fp.string("SOD-323HE").json().fn).toBe("sod323he")
})

test("standard package builders retain global footprint modifiers", () => {
  const pads = fp()
    .do219ad()
    .origin("pin1")
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")

  expect(pads[0]?.x).toBe(0)
  expect(pads[1]?.x).toBeCloseTo(1.84)
})

test("standard packages accept validated land and mechanical overrides", () => {
  const parameters = fp
    .string(
      "sod323he_p2.2mm_pw0.85mm_ph1.15mm_bodylength2.1mm_bodywidth1.5mm_bodyheight0.8mm_leadspan2.7mm_standoff0.1mm",
    )
    .json()

  expect(parameters).toMatchObject({
    p: 2.2,
    pw: 0.85,
    ph: 1.15,
    bodylength: 2.1,
    bodywidth: 1.5,
    bodyheight: 0.8,
    leadspan: 2.7,
    standoff: 0.1,
  })
})

test("standard packages reject unknown and invalid parameters", () => {
  expect(() => fp.string("do219ad_madeup1mm").json()).toThrow(
    "Unrecognized key",
  )
  expect(() =>
    fp.string("do219ad_bodyheight0.1mm_standoff0.2mm").json(),
  ).toThrow("bodyheight must be greater than standoff")
  expect(() => fp.string("sod323he_cathodepin1_anodepin1").json()).toThrow(
    "anode and cathode must use different pins",
  )
})

test("dfn2 is an explicit two-lead family and carries mechanical dimensions", () => {
  const footprint =
    "dfn2_w1.6mm_pl0.6mm_pw0.6mm_bodywidth1mm_bodylength0.6mm_bodythickness0.35mm_standoff0.025mm_terminalinset0.05mm_terminalthickness0.05mm_pin1terminalchamfer0.03mm_pin1markwidth0.1mm"
  const parameters = fp.string(footprint).json()

  expect(parameters).toMatchObject({
    fn: "dfn",
    num_pins: 2,
    bodywidth: 1,
    bodylength: 0.6,
    bodythickness: 0.35,
    standoff: 0.025,
    terminalinset: 0.05,
    terminalthickness: 0.05,
    pin1terminalchamfer: 0.03,
    pin1markwidth: 0.1,
  })

  expect(
    convertCircuitJsonToPcbSvg(fp.string(footprint).circuitJson(), {
      showCourtyards: true,
    }),
  ).toMatchSvgSnapshot(import.meta.path, "dfn2-explicit-package")
})
