import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { isPin1Silkscreen } from "../src/helpers/add-pin1-silkscreen"

const names = [
  "soic8",
  "soic16",
  "ssop4",
  "ssop16",
  "tssop8",
  "tssop20",
  "vssop8",
  "qfn32",
  "qfp48_w14_p1mm",
  "tqfp64",
  "dfn8_w5.3mm_p1.27mm",
  "dip8",
  "bga64",
  "lga16",
  "sot23",
  "sot363",
  "sot223",
  "pinrow6",
  "smdpinheader6",
  "jst4_sh",
  "jst4_ph",
  "son8",
  "vson8_grid3x3mm_p0.65mm_ep1.65x2.4mm_w2.9mm_pinw0.85mm_pinh0.35mm",
  "wson8",
  "dpak",
  "d2pak",
  "to220",
  "to92",
]
for (const name of names) {
  test(`${name} identifies physical pin 1 on native silkscreen`, () => {
    const elements = fp.string(name).circuitJson()
    expect(elements.some(isPin1Silkscreen)).toBeTrue()
    expect(convertCircuitJsonToPcbSvg(elements)).toMatchSvgSnapshot(
      import.meta.path,
      `pin1-${name}`,
    )
    const disabled = fp.string(`${name}_nosilkscreen`).circuitJson()
    expect(disabled.some(isPin1Silkscreen)).toBeFalse()
    expect(convertCircuitJsonToPcbSvg(disabled)).toMatchSvgSnapshot(
      import.meta.path,
      `pin1-${name}-disabled`,
    )
  })
}

test("SOIC marker has copper clearance and follows rotated pin identity", () => {
  for (const side of ["leftside", "rightside", "topside", "bottomside"]) {
    const alignment =
      side === "leftside" || side === "rightside" ? "top" : "left"
    const name = `soic8_pin1location(${side},${alignment})`
    const elements = fp.string(name).origin("pin1").circuitJson()
    const pin1 = elements.find(
      (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("1"),
    )!
    expect(pin1.x).toBeCloseTo(0)
    expect(pin1.y).toBeCloseTo(0)
    const mark = elements.find(
      (e) =>
        e.type === "pcb_silkscreen_path" &&
        e.pcb_silkscreen_path_id === "assembly_pin1_marker",
    )!
    expect(mark.stroke_width).toBe(0.15)
    const pads = elements.filter((e) => e.type === "pcb_smtpad")
    for (const p of mark.route) {
      for (const pad of pads) {
        const dx = Math.abs(p.x - pad.x) - pad.width / 2
        const dy = Math.abs(p.y - pad.y) - pad.height / 2
        expect(Math.max(dx, dy)).toBeGreaterThanOrEqual(0.325 - 1e-8)
      }
    }
    expect(convertCircuitJsonToPcbSvg(elements)).toMatchSvgSnapshot(
      import.meta.path,
      `pin1-${side}-origin`,
    )
  }
})

test("resistor and capacitor arrays receive no invented electrical orientation", () => {
  for (const name of ["res0603", "cap0603", "0402_x4"]) {
    const elements = fp.string(name).circuitJson()
    expect(
      elements.some(
        (e) =>
          e.type === "pcb_silkscreen_path" &&
          e.pcb_silkscreen_path_id === "assembly_pin1_marker",
      ),
    ).toBeFalse()
    expect(convertCircuitJsonToPcbSvg(elements)).toMatchSvgSnapshot(
      import.meta.path,
      `pin1-control-${name}`,
    )
  }
})

test("default BGA marker identifies A1 instead of the opposite Y corner", () => {
  for (const origin of ["tl", "tr", "bl", "br"]) {
    const name = `bga64_${origin}origin`
    const elements = fp.string(name).circuitJson()
    const a1 = elements.find(
      (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("A1"),
    )!
    const marker = elements.find(
      (e) =>
        e.type === "pcb_silkscreen_path" &&
        e.pcb_silkscreen_path_id === "pin1_marker",
    )!
    expect(Math.sign(marker.route[0].x)).toBe(Math.sign(a1.x))
    expect(Math.sign(marker.route[0].y)).toBe(Math.sign(a1.y))
    expect(convertCircuitJsonToPcbSvg(elements)).toMatchSvgSnapshot(
      import.meta.path,
      `pin1-${name}-A1`,
    )
  }
})
