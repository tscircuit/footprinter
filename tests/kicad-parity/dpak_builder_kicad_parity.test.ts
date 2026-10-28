import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../../src/footprinter"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

for (const [family, alias, kicadName, dimensions] of [
  ["dpak", "dpak_5", "TO-252-5_TabPin6", [1.14, 0.8, 2.2, 6.4, 5.8, 6.3]],
  ["to252", "TO-252-5", "TO-252-5_TabPin6", [1.14, 0.8, 2.2, 6.4, 5.8, 6.3]],
  ["to263", "TO-263-5", "TO-263-5_TabPin6", [1.7, 1.1, 4.6, 9.4, 10.8, 9.15]],
  ["d2pak", "d2pak5", "TO-263-5_TabPin6", [1.7, 1.1, 4.6, 9.4, 10.8, 9.15]],
] as const) {
  test(`parity/${family} five-lead builder`, async () => {
    // Use the reference land dimensions; this regression concerns pad count.
    const [p, pw, pl, tabw, tabh, span] = dimensions
    const circuitJson = fp()
      [family](5)
      .p(`${p}mm`)
      .pw(`${pw}mm`)
      .pl(`${pl}mm`)
      .tabw(`${tabw}mm`)
      .tabh(`${tabh}mm`)
      .span(`${span}mm`)
      .circuitJson()
    const footprint = `${alias}_p${p}mm_pw${pw}mm_pl${pl}mm_tabw${tabw}mm_tabh${tabh}mm_span${span}mm`

    // The parity helper accepts strings, so first prove the builder emits the
    // same geometry as the string being compared with the KiCad reference.
    expect(circuitJson).toEqual(fp.string(footprint).circuitJson())
    expect(
      circuitJson
        .filter((element) => element.type === "pcb_smtpad")
        .map((pad) => pad.port_hints),
    ).toEqual([["1"], ["2"], ["3"], ["4"], ["5"], ["6"]])

    const {
      avgRelDiff,
      courtyardDiffPercent,
      combinedFootprintElements,
      booleanDifferenceSvg,
    } = await compareFootprinterVsKicad(
      footprint,
      `Package_TO_SOT_SMD.pretty/${kicadName}.circuit.json`,
    )

    expect(avgRelDiff).toBeCloseTo(0, 6)
    expect(courtyardDiffPercent).toBeLessThan(0.5)
    expect(
      convertCircuitJsonToPcbSvg(combinedFootprintElements, {
        showCourtyards: true,
      }),
    ).toMatchSvgSnapshot(import.meta.path, `${family}_five_lead_builder`)
    expect(booleanDifferenceSvg).toMatchSvgSnapshot(
      import.meta.path,
      `${family}_five_lead_builder_boolean_difference`,
    )
  }, 10000)
}
