import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp, getFootprintNames } from "../src/footprinter"

test("SPDIP-28 uses the 300 mil row spacing and 100 mil pitch", () => {
  const holes = fp
    .string("SPDIP-28")
    .circuitJson()
    .filter((element) => element.type === "pcb_plated_hole")
  expect(holes).toHaveLength(28)
  // Microchip C04-070, 28-lead skinny plastic DIP: 0.100 inch pitch.
  // Through-hole rows use the 0.300 inch insertion grid, not free lead-tip span.
  for (let index = 0; index < 28; index++) {
    const hole = holes[index]!
    const left = index < 14
    const expectedY = left ? 16.51 - index * 2.54 : -16.51 + (index - 14) * 2.54
    expect(hole.x).toBeCloseTo(left ? -3.81 : 3.81, 8)
    expect(hole.y).toBeCloseTo(expectedY, 8)
    expect(hole.port_hints).toContain(String(index + 1))
  }
  expect(holes[0]!.shape).toBe("circular_hole_with_rect_pad")
  expect(holes.slice(1).every((hole) => hole.shape === "circle")).toBe(true)
})

test("SPDIP aliases and default builder produce the same 28-pin footprint", () => {
  const expected = fp().spdip(28).circuitJson()
  for (const name of ["spdip", "spdip28", "SPDIP28", "SPDIP-28", "spdip-28"]) {
    expect(fp.string(name).circuitJson()).toEqual(expected)
  }
  expect(fp().spdip().circuitJson()).toEqual(expected)
  expect(getFootprintNames()).toContain("spdip")
})

test("SPDIP preserves DIP geometry and supports explicit drill and pad sizes", () => {
  expect(fp.string("SPDIP-28_id1mm_od1.8mm").circuitJson()).toEqual(
    fp.string("dip28_w7.62mm_p2.54mm_id1mm_od1.8mm").circuitJson(),
  )
  expect(fp.string("spdip28").json()).toMatchObject({
    fn: "spdip",
    num_pins: 28,
    w: 7.62,
    p: 2.54,
    id: 0.8,
    od: 1.6,
  })
})

test("SPDIP global modifiers retain pin-one relocation and omit silkscreen", () => {
  expect(
    fp
      .string("SPDIP-28_pin1location(leftside,bottom)_nosilkscreen")
      .circuitJson(),
  ).toEqual(
    fp.string("dip28_pin1location(leftside,bottom)_nosilkscreen").circuitJson(),
  )
})

test("spdip28", () => {
  expect(
    convertCircuitJsonToPcbSvg(fp.string("SPDIP-28").circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "spdip28")
})

test("spdip28_custom_drill", () => {
  expect(
    convertCircuitJsonToPcbSvg(
      fp.string("spdip28_id1mm_od1.8mm").circuitJson(),
    ),
  ).toMatchSvgSnapshot(import.meta.path, "spdip28_custom_drill")
})
