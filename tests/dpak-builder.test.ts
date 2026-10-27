import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

for (const [family, alias, snapshotFamily] of [
  ["dpak", "dpak", "dpak"],
  ["d2pak", "d2pak", "d2pak"],
  ["to252", "TO-252-", "dpak"],
  ["to263", "TO-263-", "d2pak"],
] as const) {
  for (const pinCount of [3, 5, 6] as const) {
    test(`${family}(${pinCount}) preserves lead and tab numbering`, () => {
      const builder = fp()[family](pinCount)
      const circuitJson = builder.circuitJson()
      const pads = circuitJson.filter(
        (element) => element.type === "pcb_smtpad",
      )
      const expectedPadCount = pinCount === 3 ? 3 : 6

      expect(builder.json().num_pins).toBe(expectedPadCount)
      expect(pads).toHaveLength(expectedPadCount)
      expect(pads.map((pad) => pad.port_hints)).toEqual(
        pinCount === 3
          ? [["1"], ["3"], ["2"]]
          : [["1"], ["2"], ["3"], ["4"], ["5"], ["6"]],
      )
      expect(circuitJson).toEqual(
        fp.string(`${alias}${pinCount}`).circuitJson(),
      )
      expect(
        convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
      ).toMatchSvgSnapshot(
        import.meta.path,
        `${snapshotFamily}-builder-${expectedPadCount}-pads`,
      )
    })
  }
}
