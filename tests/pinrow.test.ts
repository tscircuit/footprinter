import { expect, test } from "bun:test"
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

test("pinrow uses explicit courtyard dimensions", () => {
  const definition = "pinrow3_cyw8.12mm_cyh3.04mm"
  const circuitJson = fp.string(definition).circuitJson()
  const courtyard = circuitJson.find(
    (element) => element.type === "pcb_courtyard_rect",
  )

  expect(courtyard).toMatchObject({
    width: 8.12,
    height: 3.04,
  })
  expect(
    convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, definition)
})

for (const definition of ["pinrow3_cyw8.12mm", "pinrow3_cyh3.04mm"]) {
  test(`${definition} requires both courtyard dimensions`, () => {
    expect(() => fp.string(definition).circuitJson()).toThrow(
      "'cyw' and 'cyh' must be provided together",
    )
  })
}

test("pinrow silkscreen border and custom module label", () => {
  const definition =
    "pinrow14_rows2_p2.54mm_py15.24mm_female_silkscreenborder_silkscreenlabel(XIAO RP2040)"
  const circuitJson = fp.string(definition).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  const params = fp.string(definition).json()

  expect(params).toMatchObject({
    fn: "pinrow",
    num_pins: 14,
    rows: 2,
    female: true,
    silkscreenborder: true,
    silkscreenlabel: "XIAO RP2040",
  })
  expect(
    circuitJson.filter((element) => element.type === "pcb_silkscreen_path"),
  ).toHaveLength(1)
  expect(
    circuitJson.find(
      (element) =>
        element.type === "pcb_silkscreen_text" &&
        element.text === "XIAO RP2040",
    ),
  ).toMatchObject({
    anchor_position: { x: 0, y: 0 },
    anchor_alignment: "center",
  })
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow14_silkscreenborder_silkscreenlabel",
  )
})

test("headermodule silkscreen border and custom module label", () => {
  const definition =
    "headermodule14_rows2_p2.54mm_py15.24mm_female_silkscreenborder_silkscreenlabel(XIAO RP2040)"
  const circuitJson = fp.string(definition).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  const params = fp.string(definition).json()

  expect(params).toMatchObject({
    fn: "headermodule",
    num_pins: 14,
    rows: 2,
    p: 2.54,
    py: 15.24,
    female: true,
    silkscreenborder: true,
    silkscreenlabel: "XIAO RP2040",
  })
  expect(
    circuitJson.filter(
      (element) =>
        element.type === "pcb_silkscreen_path" &&
        element.pcb_component_id === "",
    ),
  ).toHaveLength(1)
  const pin1Arrow = circuitJson.find(
    (element) =>
      element.type === "pcb_silkscreen_path" &&
      element.pcb_silkscreen_path_id === "pin_marker_1",
  )
  expect(pin1Arrow).toMatchObject({ pcb_component_id: "pin_marker_1" })
  if (pin1Arrow?.type === "pcb_silkscreen_path") {
    expect(pin1Arrow.route).toHaveLength(4)
    expect(pin1Arrow.route[0]).toMatchObject({ x: -8.52, y: 7.62 })
    expect(pin1Arrow.route[1]?.x).toBe(-9.12)
    expect(pin1Arrow.route[1]?.y).toBeCloseTo(7.02)
    expect(pin1Arrow.route[2]?.x).toBe(-9.12)
    expect(pin1Arrow.route[2]?.y).toBeCloseTo(8.22)
    expect(pin1Arrow.route[3]).toMatchObject({ x: -8.52, y: 7.62 })
  }
  const platedHoleYs = circuitJson
    .filter((element) => element.type === "pcb_plated_hole")
    .map((element) => element.y)
    .filter((y): y is number => typeof y === "number")
  expect([...new Set(platedHoleYs)].sort((a, b) => a - b)).toEqual([
    -7.62, 7.62,
  ])
  const platedHoleXs = circuitJson
    .filter((element) => element.type === "pcb_plated_hole")
    .map((element) => element.x)
    .filter((x): x is number => typeof x === "number")
  expect(
    [...new Set(platedHoleXs)]
      .sort((a, b) => a - b)
      .map((x) => Number(x.toFixed(2))),
  ).toEqual([-7.62, -5.08, -2.54, 0, 2.54, 5.08, 7.62])
  expect(
    circuitJson.find(
      (element) =>
        element.type === "pcb_silkscreen_text" &&
        element.text === "XIAO RP2040",
    ),
  ).toMatchObject({
    anchor_position: { x: 0, y: 0 },
    anchor_alignment: "center",
  })
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "headermodule14_silkscreenborder_silkscreenlabel",
  )
})

test("pinheader5_female_rows2 (alias)", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(
    fp.string("pinheader5_female_rows2").circuitJson(),
  )
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("pinrow5_female_rows2").circuitJson(),
  )

  expect(aliasSvg).toEqual(canonicalSvg)
})

test("pinrow4_rows2", () => {
  const circuitJson = fp.string("pinrow4_rows2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow4_rows2_1")
})

test("pinrow4_rows2 geometry is centered on origin", () => {
  const circuitJson = fp.string("pinrow4_rows2").circuitJson()
  const padYs = circuitJson
    .filter((el) => el.type === "pcb_plated_hole" || el.type === "pcb_smtpad")
    .map((el) => el.y)
    .filter((y): y is number => typeof y === "number")
    .sort((a, b) => a - b)
  const courtyard = circuitJson.find((el) => el.type === "pcb_courtyard_rect")
  const refText = circuitJson.find(
    (el) => el.type === "pcb_silkscreen_text" && el.text === "{REF}",
  )

  expect(padYs).toEqual([-1.27, -1.27, 1.27, 1.27])
  expect(courtyard?.center).toEqual({ x: 0, y: 0 })
  expect(refText?.anchor_position).toEqual({ x: 0, y: 3.81 })
})

const verticalColumnLabelCases = [
  {
    side: "left",
    definition: "pinrow4_rows4_nosquareplating_pinlabeltextalignright",
    expectedX: -1.35,
    anchorAlignment: "center_right",
  },
  {
    side: "right",
    definition: "pinrow4_rows4_nosquareplating_pinlabeltextalignleft",
    expectedX: 1.35,
    anchorAlignment: "center_left",
  },
] as const

for (const {
  side,
  definition,
  expectedX,
  anchorAlignment,
} of verticalColumnLabelCases) {
  test(`vertical pin column keeps labels on the ${side} of plated holes`, () => {
    const circuitJson = fp.string(definition).circuitJson()
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
    const platedHoles = circuitJson.filter(
      (element) => element.type === "pcb_plated_hole",
    )
    const pinLabels = circuitJson.filter(
      (element) =>
        element.type === "pcb_silkscreen_text" &&
        element.text.startsWith("{PIN"),
    )
    const pinYs = [3.81, 1.27, -1.27, -3.81]

    expect(platedHoles.map(({ x, y }) => ({ x, y }))).toEqual(
      pinYs.map((y) => ({ x: 0, y })),
    )
    expect(pinLabels).toMatchObject(
      pinYs.map((y, index) => ({
        text: `{PIN${index + 1}}`,
        anchor_position: { x: expectedX, y },
        anchor_alignment: anchorAlignment,
      })),
    )
    expect(svgContent).toMatchSvgSnapshot(
      import.meta.path,
      `pinrow4_vertical_column_labels_${side}`,
    )
  })
}

test("pinrow8_rows4", () => {
  const circuitJson = fp.string("pinrow8_rows4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow8_rows4_1")
})

test("pinrow9_male_rows3", () => {
  const circuitJson = fp.string("pinrow9_male_rows3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })

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
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })

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
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })

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

test("pinrow6 sparse 5x2 relay grid", () => {
  const definition =
    "pinrow6_rows2_cols5_p2.54mm_py5.08mm_missing(3,4,8,9)_nosquareplating_od2.1mm_id1.2mm_nopinlabels"
  const circuitJson = fp.string(definition).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  const platedHoles = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )

  expect(
    platedHoles.map(({ x, y, port_hints }) => ({ x, y, port_hints })),
  ).toEqual([
    { x: -5.08, y: 2.54, port_hints: ["1"] },
    { x: -2.54, y: 2.54, port_hints: ["2"] },
    { x: 5.08, y: 2.54, port_hints: ["3"] },
    { x: -5.08, y: -2.54, port_hints: ["4"] },
    { x: -2.54, y: -2.54, port_hints: ["5"] },
    { x: 5.08, y: -2.54, port_hints: ["6"] },
  ])
  expect(fp.string(definition).json()).toMatchObject({
    fn: "pinrow",
    num_pins: 6,
    rows: 2,
    cols: 5,
    p: 2.54,
    py: 5.08,
    missing: [3, 4, 8, 9],
  })
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow6_sparse_5x2_relay_grid",
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
      const snapshotName = `pinrow5_textalign${textAlign}${orthoState.name}${invertedState.name}`

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
  const svgContent = convertCircuitJsonToPcbSvg(soup, { showCourtyards: true })

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
test("pinrow5_bottomsidepinlabel", () => {
  const def = "pinrow5_bottomsidepinlabel"
  const soup = fp.string(def).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup, { showCourtyards: true })

  const pinrowJson = fp.string(def).json() as any
  expect(pinrowJson.bottomsidepinlabel).toBe(true)

  // Check for bottom-layer ref label

  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "pinrow5_bottomsidepinlabel",
  )
})

test("pinrow3_smd", () => {
  const circuitJson = fp.string("pinrow3_smd").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  const pinrowJson = fp.string("pinrow3_smd").json()
  expect(pinrowJson).toMatchObject({
    fn: "pinrow",
    num_pins: 3,
    p: 2.54,
    smd: true,
    rightangle: false,
    pw: 1,
    pl: 2,
  })

  // Verify SMD pads are used instead of plated holes
  expect(circuitJson.some((el) => el.type === "pcb_smtpad")).toBe(true)
  expect(circuitJson.some((el) => el.type === "pcb_plated_hole")).toBe(false)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow3_smd")
})

test("pinrow3_smd_rightangle_male", () => {
  const circuitJson = fp.string("pinrow3_smd_rightangle_male").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })

  const pinrowJson = fp.string("pinrow3_smd_rightangle_male").json()
  expect(pinrowJson).toMatchObject({
    fn: "pinrow",
    num_pins: 3,
    p: 2.54,
    smd: true,
    rightangle: true,
    male: true,
    female: false,
    pw: 1,
    pl: 2,
  })

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow3_smd_ra_male")
})
