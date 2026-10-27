import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

for (const [family, aliases, snapshotFamily] of [
  ["dpak", ["dpak", "dpak_", "dpak-"], "dpak"],
  ["d2pak", ["d2pak", "d2pak_", "d2pak-"], "d2pak"],
  ["to252", ["to252", "to252_", "to252-", "TO-252-"], "dpak"],
  ["to263", ["to263", "to263_", "to263-", "TO-263-"], "d2pak"],
] as const) {
  for (const pinCount of [3, 5, 6] as const) {
    test(`${family}(${pinCount}) preserves lead and tab numbering across string aliases`, () => {
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
      for (const alias of aliases) {
        const aliasDef = `${alias}${pinCount}`
        expect(fp.string(aliasDef).json().num_pins).toBe(expectedPadCount)
        expect(circuitJson).toEqual(fp.string(aliasDef).circuitJson())
      }
      expect(
        convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
      ).toMatchSvgSnapshot(
        import.meta.path,
        `${snapshotFamily}-builder-${expectedPadCount}-pads`,
      )
    })
  }
}
