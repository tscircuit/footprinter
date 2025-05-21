import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("pinrow5", () => {
  const soup = fp.string("pinrow5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  const pinrowJson = fp.string("pinrow5_female").json()
  expect(pinrowJson).toMatchObject({
    fn: "pinrow",
    num_pins: 5,
    p: 2.54,
    id: 1,
    od: 1.5,
    female: true,
    male: false,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow5")
})

test("pinrow4_rows2", () => {
  const circuitJson = fp.string("pinrow4_rows2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow4_rows2")
})

test("pinrow8_rows4", () => {
  const circuitJson = fp.string("pinrow8_rows4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow8_rows4")
})

test("pinrow9_male_rows3", () => {
  const circuitJson = fp.string("pinrow9_male_rows3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  const pinrowJson = fp.string("pinrow9_male_rows3").json()

  expect(pinrowJson).toMatchObject({
    fn: "pinrow",
    num_pins: 9,
    p: 2.54,
    id: 1,
    od: 1.5,
    male: true,
    female: false,
    rows: 3,
  })

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow9_male_rows3")
})

test("pinrow6_female_rows2", () => {
  const circuitJson = fp.string("pinrow6_female_rows2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  const pinrowJson = fp.string("pinrow6_female_rows2").json()

  expect(pinrowJson).toMatchObject({
    fn: "pinrow",
    num_pins: 6,
    p: 2.54,
    id: 1,
    od: 1.5,
    male: false,
    female: true,
    rows: 2,
  })

  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow6_female_rows2",
  )
})

test("pinrow6_nosquareplating", () => {
  const circuitJson = fp.string("pinrow6_nosquareplating").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  const pinrowJson = fp.string("pinrow6_nosquareplating").json()

  // Verify parsed parameters
  expect(pinrowJson).toMatchObject({
    fn: "pinrow",
    num_pins: 6,
    p: 2.54,
    id: 1,
    od: 1.5,
    male: true,
    female: false,
    rows: 1,
    nosquareplating: true,
  })

  // Verify SVG snapshot
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow6_nosquareplating",
  )
})
