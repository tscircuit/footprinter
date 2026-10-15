import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

for (const pinCount of [3, 5, 6, 8]) {
  test(`sot23 builder preserves ${pinCount} pins`, () => {
    const circuitJson = fp().sot23(pinCount).circuitJson()
    const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

    expect(pads).toHaveLength(pinCount)
    expect(circuitJson).toEqual(fp.string(`sot23_${pinCount}`).circuitJson())

    const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
    expect(svgContent).toMatchSvgSnapshot(
      import.meta.path,
      `sot23_builder_${pinCount}`,
    )
  })
}

test("sot23 builder defaults to three pins", () => {
  const circuitJson = fp().sot23().circuitJson()
  expect(circuitJson).toEqual(fp.string("sot23").circuitJson())

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot23_builder_default",
  )
})

test("sot23 builder rejects unsupported pin counts", () => {
  expect(() => fp().sot23(4).circuitJson()).toThrow("Invalid number of pins")
})
