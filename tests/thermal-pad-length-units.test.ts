import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { dim2d } from "../src/helpers/zod/dim-2d"

for (const family of ["qfn32", "soic8", "dfn8"] as const) {
  test(`${family} converts both thermal-pad dimensions to millimeters`, () => {
    const reference = fp
      .string(`${family}_thermalpad2.54mmx2.54mm`)
      .circuitJson()

    for (const dimensions of [
      "0.1inx0.1in",
      "0.254cmx0.254cm",
      "100milx100mil",
      "0.1inx2.54mm",
    ]) {
      const circuit = fp
        .string(`${family}_thermalpad${dimensions}`)
        .circuitJson()
      const thermalPad = circuit.find(
        (element) =>
          element.type === "pcb_smtpad" &&
          element.port_hints?.includes("thermalpad"),
      )
      expect(thermalPad).toMatchObject({ width: 2.54, height: 2.54 })
      expect(circuit).toEqual(reference)
      expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
        import.meta.path,
        `${family}-thermal-pad-length-units`,
      )
    }
  })
}

test("compound lengths retain unitless dimensions and grid counts", () => {
  expect(dim2d.parse("2.4x3mm")).toEqual({ x: 2.4, y: 3 })
  expect(dim2d.parse("2.4mmx3mm")).toEqual({ x: 2.4, y: 3 })
  expect(dim2d.parse("3x4")).toEqual({ x: 3, y: 4 })
  expect(dim2d.parse("3 4")).toEqual({ x: 3, y: 4 })
})

test("thermal-pad builder converts inch dimensions", () => {
  const circuit = fp().soic(8).thermalpad("0.1inx0.1in").circuitJson()
  expect(circuit).toEqual(
    fp.string("soic8_thermalpad2.54mmx2.54mm").circuitJson(),
  )
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8-thermal-pad-builder-length-units",
  )
})
