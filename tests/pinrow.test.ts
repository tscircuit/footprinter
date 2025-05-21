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
    pinlabelpositionup: false,
    pinlabelpositiondown: false,
    pinlabelpositionleft: false,
    pinlabelpositionright: false,
    pinlabelparallel: false,
    pinlabelinverted: false,
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
    pinlabelpositionup: false,
    pinlabelpositiondown: false,
    pinlabelpositionleft: false,
    pinlabelpositionright: false,
    pinlabelparallel: false,
    pinlabelinverted: false,
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
    pinlabelpositionup: false,
    pinlabelpositiondown: false,
    pinlabelpositionleft: false,
    pinlabelpositionright: false,
    pinlabelparallel: false,
    pinlabelinverted: false,
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

const pinLabelEffectivePositions = ["Up", "Down", "Left", "Right"] as const
const rotationConfigs = [
  { parallel: false, inverted: false, rotation: 0 },
  { parallel: true, inverted: false, rotation: 90 },
  { parallel: false, inverted: true, rotation: 180 },
  { parallel: true, inverted: true, rotation: 270 },
]

for (const effectivePos of pinLabelEffectivePositions) {
  for (const rotConfig of rotationConfigs) {
    let def = `pinrow5`

    if (effectivePos === "Up") {
      def += "_pinlabelpositionup"
    } else if (effectivePos === "Down") {
      def += "_pinlabelpositiondown"
    } else if (effectivePos === "Left") {
      def += "_pinlabelpositionleft"
    } else if (effectivePos === "Right") {
      def += "_pinlabelpositionright"
    }

    if (rotConfig.parallel) {
      def += "_pinlabelparallel"
    }
    if (rotConfig.inverted) {
      def += "_pinlabelinverted"
    }

    test(`pinrow5 ${def} (effectivePos: ${effectivePos}, rotation: ${rotConfig.rotation})`, () => {
      const soup = fp.string(def).circuitJson()
      const svgContent = convertCircuitJsonToPcbSvg(soup)
      // Snapshot name uses the effective position and conceptual rotation
      const snapshotName = `pinrow5_labelposition${effectivePos}_labelrotation${rotConfig.rotation}`
      expect(svgContent).toMatchSvgSnapshot(import.meta.path, snapshotName)
    })
  }
}
