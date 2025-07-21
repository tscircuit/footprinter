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
    pinlabeltextalignleft: false,
    pinlabeltextaligncenter: false,
    pinlabeltextalignright: false,
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
    pinlabeltextalignleft: false,
    pinlabeltextaligncenter: false,
    pinlabeltextalignright: false,
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
    pinlabeltextalignleft: false,
    pinlabeltextaligncenter: false,
    pinlabeltextalignright: false,
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

const textAlignments = ["left", "center", "right"] as const
const orthogonalStates = [
  { name: "", value: false },
  { name: "_orthogonal", value: true },
] as const
const invertedStates = [
  { name: "", value: false },
  { name: "_verticallyinverted", value: true },
] as const

for (const textAlign of textAlignments) {
  for (const orthoState of orthogonalStates) {
    for (const invertedState of invertedStates) {
      let def = `pinrow5_pinlabeltextalign${textAlign}`
      if (orthoState.value) {
        def += "_pinlabelorthogonal"
      }
      if (invertedState.value) {
        def += "_pinlabelverticallyinverted"
      }

      // Construct snapshot name similar to the definition string but more readable for file names
      let snapshotName = `pinrow5_textalign${textAlign}${orthoState.name}${invertedState.name}`

      test(`Test: ${def} (Snapshot: ${snapshotName})`, () => {
        const soup = fp.string(def).circuitJson()
        const svgContent = convertCircuitJsonToPcbSvg(soup)

        const pinrowJson = fp.string(def).json() as any
        expect(pinrowJson.pinlabeltextalignleft).toBe(textAlign === "left")
        expect(pinrowJson.pinlabeltextaligncenter).toBe(textAlign === "center")
        expect(pinrowJson.pinlabeltextalignright).toBe(textAlign === "right")
        expect(pinrowJson.pinlabelorthogonal).toBe(orthoState.value)
        expect(pinrowJson.pinlabelverticallyinverted).toBe(invertedState.value)

        expect(svgContent).toMatchSvgSnapshot(import.meta.path, snapshotName)
      })
    }
  }
}

test("pinrow5_doublesidedpinlabel", () => {
  const def = "pinrow5_doublesidedpinlabel"
  const soup = fp.string(def).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  const pinrowJson = fp.string(def).json() as any
  expect(pinrowJson.doublesidedpinlabel).toBe(true)

  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow5_doublesidedpinlabel",
  )
})

test("pinrow5_nopinlabels", () => {
  const def = "pinrow5_nopinlabels"
  const soup = fp.string(def).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  const pinrowJson = fp.string(def).json() as any
  expect(pinrowJson.nopinlabels).toBe(true)
  expect(
    soup.some(
      (el) => el.type === "pcb_silkscreen_text" && el.text?.startsWith("{PIN"),
    ),
  ).toBe(false)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow5_nopinlabels")
})
test("pinrow5_backsidelabel", () => {
  const def = "pinrow5_backsidelabel"
  const soup = fp.string(def).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  const pinrowJson = fp.string(def).json() as any
  expect(pinrowJson.backsidelabel).toBe(true)

  // Check for bottom-layer ref label

  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow5_backsidelabel",
  )
})
