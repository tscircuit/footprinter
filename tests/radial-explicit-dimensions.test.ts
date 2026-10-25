import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const cases = [
  [
    "explicit-mm",
    "radial_p2.54mm_id0.8mm_od1.6mm",
    () => fp().radial().p(2.54).id(0.8).od(1.6),
    0.8,
    1.6,
  ],
  [
    "explicit-polarized",
    "radial_p2.54mm_id0.8mm_od1.6mm_polarized",
    () => fp().radial().p(2.54).id(0.8).od(1.6).polarized(),
    0.8,
    1.6,
  ],
  [
    "explicit-electrolytic",
    "radial_p2.54mm_id0.8mm_od1.6mm_electrolytic",
    () => fp().radial().p(2.54).id(0.8).od(1.6).electrolytic(),
    0.8,
    1.6,
  ],
  [
    "explicit-cm",
    "radial_p0.254cm_id0.08cm_od0.16cm",
    () => fp().radial().p("0.254cm").id("0.08cm").od("0.16cm"),
    0.8,
    1.6,
  ],
  [
    "explicit-um",
    "radial_p2540um_id800um_od1600um",
    () => fp().radial().p("2540um").id("800um").od("1600um"),
    0.8,
    1.6,
  ],
  [
    "explicit-id-only",
    "radial_p2.54mm_id0.8mm",
    () => fp().radial().p(2.54).id(0.8),
    0.8,
    1.27,
  ],
  [
    "explicit-od-only",
    "radial_p2.54mm_od1.6mm",
    () => fp().radial().p(2.54).od(1.6),
    0.635,
    1.6,
  ],
  [
    "omitted-pitch254",
    "radial_p2.54mm",
    () => fp().radial().p(2.54),
    0.635,
    1.27,
  ],
  ["omitted-pitch8", "radial_p8mm", () => fp().radial().p(8), 2, 4],
  [
    "omitted-polarized",
    "radial_p2.54mm_polarized",
    () => fp().radial().p(2.54).polarized(),
    0.635,
    1.27,
  ],
  ["omitted-all", "radial", () => fp().radial(), 0.8, 1.6],
  [
    "custom-id-only",
    "radial_p2.54mm_id0.9mm",
    () => fp().radial().p(2.54).id(0.9),
    0.9,
    1.6,
  ],
  [
    "custom-od-only",
    "radial_p2.54mm_od1.8mm",
    () => fp().radial().p(2.54).od(1.8),
    0.8,
    1.8,
  ],
] as const

for (const [name, definition, builder, id, od] of cases) {
  test(`radial dimensions: ${name}`, async () => {
    const fromString = fp.string(definition).circuitJson()
    const fromBuilder = builder().circuitJson()
    for (const elements of [fromString, fromBuilder]) {
      const holes = elements.filter((e) => e.type === "pcb_plated_hole")
      expect(holes).toHaveLength(2)
      for (const hole of holes) {
        expect(hole).toMatchObject({ hole_diameter: id, outer_diameter: od })
      }
    }
    expect(fromBuilder).toEqual(fromString)
    await expect(convertCircuitJsonToPcbSvg(fromString)).toMatchSvgSnapshot(
      import.meta.path,
      `radial-dimensions-${name}`,
    )
  })
}
