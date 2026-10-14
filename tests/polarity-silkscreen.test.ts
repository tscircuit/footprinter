import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { fp } from "../src/footprinter"
import { addPolaritySilkscreen } from "../src/helpers/add-polarity-silkscreen"
import { createFabricationNoteDiodeFromCircuitJson } from "../src/helpers/create-fabrication-note-diode"
import { rectpad } from "../src/helpers/rectpad"

const families = [
  "diode0402",
  "led0402",
  "led2835",
  "melf",
  "micromelf",
  "minimelf",
  "sma",
  "smb",
  "smbf",
  "smc",
  "smf",
  "sod110",
  "sod123",
  "sod123f",
  "sod123fl",
  "sod123w",
  "sod128",
  "sod323",
  "sod323f",
  "sod323fl",
  "sod323w",
  "sod523",
  "sod723",
  "sod80",
  "sod882",
  "sod882d",
  "sod923",
  "do219ad",
  "sod323he",
]
const marks = (elements: AnyCircuitElement[]) =>
  elements.filter(
    (e): e is PcbSilkscreenPath =>
      e.type === "pcb_silkscreen_path" &&
      e.pcb_silkscreen_path_id.startsWith("polarity_cathode_"),
  )
const snapshot = (elements: AnyCircuitElement[], name: string) =>
  expect(convertCircuitJsonToPcbSvg(elements)).toMatchSvgSnapshot(
    import.meta.path,
    `polarity-${name}`,
  )

for (const family of families) {
  test(`${family}: default and reversed cathode marks follow actual pads`, () => {
    const defaultPin = ["do219ad", "sod323he"].includes(family) ? 1 : 2
    for (const pin of [defaultPin, 3 - defaultPin]) {
      const name = pin === defaultPin ? family : `${family}_cathodepin${pin}`
      const elements = fp.string(name).circuitJson()
      const cathode = elements.find(
        (e) => e.type === "pcb_smtpad" && e.port_hints?.includes(String(pin)),
      )!
      expect(marks(elements)).toHaveLength(2)
      for (const mark of marks(elements)) {
        expect(mark.stroke_width).toBe(0.15)
        for (const point of mark.route) {
          if (pin === 1)
            expect(point.x + mark.stroke_width / 2).toBeLessThanOrEqual(
              cathode.x - cathode.width / 2 - 0.25 + 1e-9,
            )
          else
            expect(point.x - mark.stroke_width / 2).toBeGreaterThanOrEqual(
              cathode.x + cathode.width / 2 + 0.25 - 1e-9,
            )
        }
      }
      snapshot(elements, name)
    }
  })
}

test("RGB LED has a K beside each cathode, not an ambiguous single two-pin mark", () => {
  const elements = fp.string("led5050").circuitJson()
  expect(marks(elements)).toHaveLength(6)
  for (const pin of [4, 5, 6]) {
    const pad = elements.find(
      (e) => e.type === "pcb_smtpad" && e.port_hints?.includes(String(pin)),
    )!
    const mark = marks(elements).find(
      (e) => e.pcb_silkscreen_path_id === `polarity_cathode_${pin}_0`,
    )!
    expect(mark.route[0].x).toBeGreaterThan(pad.x + pad.width / 2)
    expect((mark.route[0].y + mark.route[1].y) / 2).toBeCloseTo(pad.y)
  }
  snapshot(elements, "led5050-three-cathodes")
  expect(() => fp.string("led5050_cathodepin1").circuitJson()).toThrow(
    "three fixed",
  )
})

test("custom pad positions keep silk and fabrication polarity on the actual cathode", () => {
  const pads = [rectpad(1, 1.5, 0, 1.2, 1), rectpad(2, -1.5, 0, 0.6, 1)]
  const elements = addPolaritySilkscreen(
    [...pads, ...createFabricationNoteDiodeFromCircuitJson(pads)],
    { fn: "led2835" },
  )
  expect(marks(elements)[0].route[0].x).toBeLessThan(-1.8)
  const cathodeSymbol = elements.find(
    (e) =>
      e.type === "pcb_fabrication_note_path" &&
      e.pcb_fabrication_note_path_id === "diode_fabrication_note_cathode",
  )!
  const anodeSymbol = elements.find(
    (e) =>
      e.type === "pcb_fabrication_note_path" &&
      e.pcb_fabrication_note_path_id === "diode_fabrication_note_anode_leg",
  )!
  expect(cathodeSymbol.route[0].x).toBeLessThan(anodeSymbol.route[0].x)
  snapshot(elements, "custom-pad-positions")
})

test("anode-only mappings derive the opposite cathode, including K1 standard packages", () => {
  for (const name of [
    "diode0603_anodepin2",
    "led0603_anodepin2",
    "do219ad_anodepin1",
    "sod323he_anodepin1",
  ]) {
    const elements = fp.string(name).circuitJson()
    const pin = name.endsWith("2") ? 1 : 2
    expect(marks(elements)[0].pcb_silkscreen_path_id).toBe(
      `polarity_cathode_${pin}_0`,
    )
    snapshot(elements, name)
  }
  expect(() =>
    fp.string("diode0603_anodepin1_cathodepin1").circuitJson(),
  ).toThrow()
})

test("marks rotate and translate by exactly the same transform as cathode pads", () => {
  const base = fp.string("diode0603_cathodepin1").circuitJson()
  const pad0 = base.find(
    (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("1"),
  )!
  const point0 = marks(base)[0].route[0]
  for (const side of ["leftside", "rightside", "topside", "bottomside"]) {
    const alignment =
      side === "leftside" || side === "rightside" ? "top" : "left"
    const name = `diode0603_cathodepin1_pin1location(${side},${alignment})`
    const elements = fp.string(name).origin("pin1").circuitJson()
    const pad = elements.find(
      (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("1"),
    )!
    expect(pad.x).toBeCloseTo(0)
    expect(pad.y).toBeCloseTo(0)
    const pad2 = elements.find(
      (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("2"),
    )!
    const distance = Math.hypot(pad2.x - pad.x, pad2.y - pad.y)
    const cos = (pad2.x - pad.x) / distance
    const sin = (pad2.y - pad.y) / distance
    const dx = point0.x - pad0.x
    const dy = point0.y - pad0.y
    const x = cos * dx - sin * dy
    const y = sin * dx + cos * dy
    expect(marks(elements)[0].route[0].x).toBeCloseTo(x)
    expect(marks(elements)[0].route[0].y).toBeCloseTo(y)
    snapshot(elements, name)
  }
})

test("nosilkscreen removes polarity marks; nonpolarized parts get no cathode marks", () => {
  for (const name of [
    "diode0603_nosilkscreen",
    "led5050_nosilkscreen",
    "res0603",
    "cap0603",
    "radial_ceramic",
  ]) {
    const elements = fp.string(name).circuitJson()
    expect(marks(elements)).toHaveLength(0)
    snapshot(elements, name)
  }
})

test("through-hole diode marks are opt-in on the otherwise generic axial package", () => {
  for (const pin of [1, 2]) {
    const name = `axial_cathodepin${pin}`
    const elements = fp.string(name).circuitJson()
    expect(marks(elements)).toHaveLength(2)
    expect(Math.sign(marks(elements)[0].route[0].x)).toBe(pin === 1 ? -1 : 1)
    snapshot(elements, name)
  }
  const unpolarized = fp.string("axial").circuitJson()
  expect(marks(unpolarized)).toHaveLength(0)
  snapshot(unpolarized, "axial-unpolarized")
})
