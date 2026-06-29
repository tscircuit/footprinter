import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import {
  compareFootprinterVsKicad,
  compareFootprinterVsKicadCircuitJson,
} from "../../fixtures/compareFootprinterVsKicad"
import { d02010603MetricCircuitJson } from "./fixtures/d_0201_0603metric"

const diodeCacheCases = [
  ["micromelf", "Diode_SMD.pretty/D_MicroMELF.circuit.json"],
  ["minimelf", "Diode_SMD.pretty/D_MiniMELF.circuit.json"],
  ["melf", "Diode_SMD.pretty/D_MELF.circuit.json"],
  ["sma", "Diode_SMD.pretty/D_SMA.circuit.json"],
  ["smb", "Diode_SMD.pretty/D_SMB.circuit.json"],
  ["smc", "Diode_SMD.pretty/D_SMC.circuit.json"],
  ["sod110", "Diode_SMD.pretty/D_SOD-110.circuit.json"],
  ["sod123", "Diode_SMD.pretty/D_SOD-123.circuit.json"],
  ["sod123f", "Diode_SMD.pretty/D_SOD-123F.circuit.json"],
  ["sod123w", "Diode_SMD.pretty/Nexperia_CFP3_SOD-123W.circuit.json"],
  ["sod128", "Diode_SMD.pretty/D_SOD-128.circuit.json"],
  ["sod323", "Diode_SMD.pretty/D_SOD-323.circuit.json"],
  ["sod323f", "Diode_SMD.pretty/D_SOD-323F.circuit.json"],
  ["sod523", "Diode_SMD.pretty/D_SOD-523.circuit.json"],
  ["sod882", "Diode_SMD.pretty/D_SOD-882.circuit.json"],
  ["sod882d", "Diode_SMD.pretty/D_SOD-882D.circuit.json"],
  ["sod923", "Diode_SMD.pretty/D_SOD-923.circuit.json"],
] as const

for (const [footprinterString, kicadPath] of diodeCacheCases) {
  test(`diode-kicad-parity/${footprinterString}`, async () => {
    const {
      avgRelDiff,
      combinedFootprintElements,
      booleanDifferenceSvg,
      courtyardDiffPercent,
    } = await compareFootprinterVsKicad(footprinterString, kicadPath)

    const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
      showCourtyards: true,
    })
    expect(courtyardDiffPercent).toBeLessThan(5)
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, footprinterString)
    expect(booleanDifferenceSvg).toMatchSvgSnapshot(
      import.meta.path,
      `${footprinterString}_boolean_difference`,
    )
    expect(avgRelDiff).toBeLessThan(0.05)
  })
}

test("diode-kicad-parity/d_0201_0603metric", () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = compareFootprinterVsKicadCircuitJson(
    "diode0201",
    d02010603MetricCircuitJson,
    "D_0201_0603Metric",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "d_0201_0603metric")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "d_0201_0603metric_boolean_difference",
  )
  expect(avgRelDiff).toBeLessThan(0.05)
})
