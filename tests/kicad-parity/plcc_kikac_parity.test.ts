import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/plcc44", async () => {
    const { combinedFootprintElements, booleanDifferenceSvg } =
        await compareFootprinterVsKicad(
            "plcc44_w16.6_h16.6_p1.27mm",
            "Package_LCC.pretty/PLCC-44_16.6x16.6mm_P1.27mm.circuit.json",
        )

    const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements)
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "plcc44_parity")
    expect(booleanDifferenceSvg).toMatchSvgSnapshot(
        import.meta.path,
        "plcc44_parity._boolean_difference",
    )
})