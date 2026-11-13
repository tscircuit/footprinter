import { expect, test } from "bun:test"
import type { PcbSmtPadRect } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getPinPositions = (footprint: string) => {
  const pads = fp
    .string(footprint)
    .circuitJson()
    .filter(
      (e): e is PcbSmtPadRect => e.type === "pcb_smtpad" && e.shape === "rect",
    )
  return new Map(
    pads.map((pad) => [pad.port_hints?.[0], { x: pad.x, y: pad.y }] as const),
  )
}

test("vson8 numbers pins counter-clockwise from the top-left pad", () => {
  const footprint =
    "vson8_grid3x3mm_p0.65mm_ep1.65x2.4mm_w2.9mm_pinw0.85mm_pinh0.35mm"
  const pins = getPinPositions(footprint)

  // Pin 1 is top-left; pins 1-4 run down the left side and pins 5-8 run up
  // the right side, matching soic/dfn/son and KiCad's VSON-8-1EP_3x3mm.
  const expected = {
    "1": { x: -1.45, y: 0.975 },
    "4": { x: -1.45, y: -0.975 },
    "5": { x: 1.45, y: -0.975 },
    "8": { x: 1.45, y: 0.975 },
  }
  for (const [pin, { x, y }] of Object.entries(expected)) {
    expect(pins.get(pin)!.x).toBeCloseTo(x)
    expect(pins.get(pin)!.y).toBeCloseTo(y)
  }

  expect(
    convertCircuitJsonToPcbSvg(fp.string(footprint).circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "vson8-pin-numbering")
})

test("vson10 numbers pins counter-clockwise from the top-left pad", () => {
  const pins = getPinPositions(
    "vson10_grid3x3mm_p0.5mm_ep1.2x2mm_w2.875mm_pinw0.875mm_pinh0.25mm",
  )

  expect(pins.get("1")!.x).toBeLessThan(0)
  expect(pins.get("1")!.y).toBeCloseTo(1)
  expect(pins.get("5")!.y).toBeCloseTo(-1)
  expect(pins.get("6")!.x).toBeGreaterThan(0)
  expect(pins.get("6")!.y).toBeCloseTo(-1)
  expect(pins.get("10")!.y).toBeCloseTo(1)
})
