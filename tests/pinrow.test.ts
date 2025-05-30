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
    pinlabeltop: false,
    pinlabelbottom: false,
    pinlabelleft: false,
    pinlabelright: false,
    pinlabelverticallyinverted: false,
    pinlabelorthogonal: false,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow5_1")
})

test("pinrow4_rows2", () => {
  const circuitJson = fp.string("pinrow4_rows2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow4_rows2_1")
})

test("pinrow8_rows4", () => {
  const circuitJson = fp.string("pinrow8_rows4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow8_rows4_1")
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
    pinlabeltop: false,
    pinlabelbottom: false,
    pinlabelleft: false,
    pinlabelright: false,
    pinlabelverticallyinverted: false,
    pinlabelorthogonal: false,
  })

  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow9_male_rows3_1",
  )
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
    pinlabeltop: false,
    pinlabelbottom: false,
    pinlabelleft: false,
    pinlabelright: false,
    pinlabelverticallyinverted: false,
    pinlabelorthogonal: false,
  })

  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow6_female_rows2_1",
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
    "pinrow6_nosquareplating_1",
  )
})

const pinLabelSides = ["top", "bottom", "left", "right"] as const
const rotationConfigs = [
  // Default: 0 deg
  { orthogonal: false, verticallyinverted: false, rotationSuffix: "" },
  // Orthogonal: 90 deg rotation
  {
    orthogonal: true,
    verticallyinverted: false,
    rotationSuffix: "_pinlabelorthogonal",
  },
  // Vertically Inverted: 180 deg flip
  {
    orthogonal: false,
    verticallyinverted: true,
    rotationSuffix: "_pinlabelverticallyinverted",
  },
  // Orthogonal AND Vertically Inverted: 90 deg rotation + 180 deg flip (effectively 270 deg or -90 deg)
  {
    orthogonal: true,
    verticallyinverted: true,
    rotationSuffix: "_pinlabelorthogonal_pinlabelverticallyinverted",
  },
]

for (const side of pinLabelSides) {
  for (const rotConfig of rotationConfigs) {
    let def = `pinrow5`

    def += `_pinlabel${side}${rotConfig.rotationSuffix}`

    const snapshotName = def

    test(`Test: ${snapshotName}`, () => {
      const soup = fp.string(def).circuitJson()
      const svgContent = convertCircuitJsonToPcbSvg(soup)
      expect(svgContent).toMatchSvgSnapshot(import.meta.path, snapshotName)
    })
  }
}
