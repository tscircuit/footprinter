import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

// Each variant describes the KiCad reference's 3.1 x 3.1 mm exposed pad.
for (const [dimensions, snapshotName] of [
  ["3.1x3.1mm", "qfn32_thermalpad3.1x3.1mm"],
  ["0.31cmx0.31cm", "qfn32_thermalpad_cm"],
  ["0.1220472441inx0.1220472441in", "qfn32_thermalpad_in"],
  ["122.0472441milx122.0472441mil", "qfn32_thermalpad_mil"],
  ["0.31cmx3.1mm", "qfn32_thermalpad_mixed_units"],
] as const) {
  test(`parity/qfn32_thermalpad${dimensions}`, async () => {
    const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
      await compareFootprinterVsKicad(
        `qfn32_thermalpad${dimensions}`,
        "Package_DFN_QFN.pretty/QFN-32-1EP_5x5mm_P0.5mm_EP3.1x3.1mm.circuit.json",
      )

    // Keep a numeric copper check alongside the reference silkscreen snapshot.
    expect(avgRelDiff).toBeCloseTo(0, 6)

    const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
      showCourtyards: true,
    })
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, snapshotName)
    expect(booleanDifferenceSvg).toMatchSvgSnapshot(
      import.meta.path,
      `${snapshotName}_boolean_difference`,
    )
  })
}
