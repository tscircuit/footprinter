import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp, getFootprintNames } from "../src/footprinter"

test("PDIP-8 uses the 300 mil row spacing and 100 mil pitch", () => {
  const holes = fp
    .string("PDIP-8")
    .circuitJson()
    .filter((element) => element.type === "pcb_plated_hole")
  expect(holes).toHaveLength(8)
  // Reference: KiCad Package_DIP.pretty/DIP-8_W7.62mm.kicad_mod.
  // Pad centers are translated to the footprint center and use upward-positive Y.
  for (let index = 0; index < 8; index++) {
    const hole = holes[index]!
    const left = index < 4
    const expectedY = left ? 3.81 - index * 2.54 : -3.81 + (index - 4) * 2.54
    expect(hole.x).toBeCloseTo(left ? -3.81 : 3.81, 8)
    expect(hole.y).toBeCloseTo(expectedY, 8)
    expect(hole.port_hints).toContain(String(index + 1))
  }
  expect(holes[0]!.shape).toBe("circular_hole_with_rect_pad")
  expect(holes.slice(1).every((hole) => hole.shape === "circle")).toBe(true)
})

test("PDIP aliases and default builder produce the same 8-pin footprint", () => {
  const expected = fp().pdip(8).circuitJson()
  for (const name of ["pdip", "pdip8", "PDIP8", "PDIP-8", "pdip-8"]) {
    expect(fp.string(name).circuitJson()).toEqual(expected)
  }
  expect(fp().pdip().circuitJson()).toEqual(expected)
  expect(getFootprintNames()).toContain("pdip")
})

test("PDIP preserves DIP geometry and supports explicit drill and pad sizes", () => {
  expect(fp.string("PDIP-8_id1mm_od1.8mm").circuitJson()).toEqual(
    fp.string("dip8_w7.62mm_p2.54mm_id1mm_od1.8mm").circuitJson(),
  )
  expect(fp.string("pdip8").json()).toMatchObject({
    fn: "pdip",
    num_pins: 8,
    w: 7.62,
    p: 2.54,
    id: 0.8,
    od: 1.6,
  })
})

test("PDIP global modifiers retain pin-one relocation and omit silkscreen", () => {
  expect(
    fp
      .string("PDIP-8_pin1location(leftside,bottom)_nosilkscreen")
      .circuitJson(),
  ).toEqual(
    fp.string("dip8_pin1location(leftside,bottom)_nosilkscreen").circuitJson(),
  )
})

test("pdip8", () => {
  expect(
    convertCircuitJsonToPcbSvg(fp.string("PDIP-8").circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

test("pdip8_custom_drill", () => {
  expect(
    convertCircuitJsonToPcbSvg(fp.string("pdip8_id1mm_od1.8mm").circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "pdip8_custom_drill")
})

test("PDIP preserves DIP width flags and explicit dimensions", () => {
  for (const options of [
    "wide",
    "narrow",
    "wide_w10mm",
    "p1.27mm",
    "nosquareplating",
  ]) {
    expect(fp.string(`pdip8_${options}`).circuitJson()).toEqual(
      fp.string(`dip8_${options}`).circuitJson(),
    )
  }
})
