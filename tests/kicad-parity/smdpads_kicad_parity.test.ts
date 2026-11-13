import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

for (const [pinCount, courtyardWidth] of [
  [2, 3.3],
  [3, 4.6],
] as const) {
  test(`parity/smdpads${pinCount} explicit open-jumper lands`, async () => {
    // Generic defaults have no package-specific KiCad reference. Check that
    // explicit dimensions still reproduce these separated copper lands.
    const {
      avgRelDiff,
      courtyardDiffPercent,
      combinedFootprintElements,
      booleanDifferenceSvg,
    } = await compareFootprinterVsKicad(
      `smdpads${pinCount}_p1.3mm_pw1mm_ph1.5mm_cyw${courtyardWidth}mm_cyh2.5mm_rounded0`,
      `Jumper.pretty/SolderJumper-${pinCount}_P1.3mm_Open_Pad1.0x1.5mm.circuit.json`,
    )

    expect(avgRelDiff).toBeCloseTo(0, 6)
    expect(courtyardDiffPercent).toBeLessThan(0.5)
    expect(
      convertCircuitJsonToPcbSvg(combinedFootprintElements, {
        showCourtyards: true,
      }),
    ).toMatchSvgSnapshot(import.meta.path, `smdpads${pinCount}_open_jumper`)
    expect(booleanDifferenceSvg).toMatchSvgSnapshot(
      import.meta.path,
      `smdpads${pinCount}_open_jumper_boolean_difference`,
    )
  }, 10000)
}
