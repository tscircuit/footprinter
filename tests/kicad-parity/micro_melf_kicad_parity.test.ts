import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/micromelf", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "micromelf",
      "Diode_SMD.pretty/D_MicroMELF.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "micromelf")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "micromelf_boolean_difference",
  )
})
