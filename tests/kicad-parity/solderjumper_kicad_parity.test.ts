import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/solderjumper", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "solderjumper2_p1.3_pw1_ph1.5",
    "Jumper.pretty/SolderJumper-2_P1.3mm_Open_Pad1.0x1.5mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "solderjumper")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "solderjumper_boolean_difference",
  )
})

// A bare "solderjumper" (no pin count) now defaults to 2 pins. Feeding it
// KiCad's SolderJumper-2 dimensions, the defaulted output lines up with the
// real KiCad SolderJumper-2 footprint, so the new default path produces
// geometrically correct pads, not just the right pad count. footprinter's own
// default dimensions (2.54mm pitch, 1.5mm pads) are a generic jumper and do not
// track a KiCad standard part, so the KiCad dims are supplied explicitly here.
test("parity/solderjumper-default-pincount", async () => {
  const {
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "solderjumper_p1.3_pw1_ph1.5",
    "Jumper.pretty/SolderJumper-2_P1.3mm_Open_Pad1.0x1.5mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "solderjumper_default_pincount",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "solderjumper_default_pincount_boolean_difference",
  )
})
