import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const c473374ThermalPadPoints = [
  { x: -1.651, y: -1.27 },
  { x: -1.651, y: -1.016 },
  { x: -1.016, y: -1.016 },
  { x: -1.016, y: 1.016 },
  { x: -1.651, y: 1.016 },
  { x: -1.651, y: 1.27 },
  { x: 1.651, y: 1.27 },
  { x: 1.651, y: 1.016 },
  { x: 1.016, y: 1.016 },
  { x: 1.016, y: -1.016 },
  { x: 1.651, y: -1.016 },
  { x: 1.651, y: -1.27 },
] as const

const cases = [
  ["soic8_thermalpad2.4x3mm", 2.4, 3],
  ["dfn8_thermalpad2.4x3mm", 2.4, 3],
  ["tssop8_thermalpad2x2.4mm", 2, 2.4],
  ["ssop8_thermalpad2x2.4mm", 2, 2.4],
  ["msop8_thermalpad1.8x2mm", 1.8, 2],
  ["vssop8_thermalpad1.8x2mm", 1.8, 2],
] as const

for (const [footprint, width, height] of cases) {
  test(`${footprint} adds a rectangular center thermal pad`, () => {
    const soup = fp.string(footprint).circuitJson()
    const pads = soup.filter((element) => element.type === "pcb_smtpad")
    const thermalPad = pads.find((pad) => pad.port_hints.includes("thermalpad"))

    expect(pads).toHaveLength(9)
    expect(thermalPad).toMatchObject({
      shape: "rect",
      x: 0,
      y: 0,
      width,
      height,
      port_hints: ["thermalpad"],
    })

    const svgContent = convertCircuitJsonToPcbSvg(soup)
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, footprint)
  })
}

test("dfn thermal pad supports independent x and y offsets", () => {
  const footprint =
    "dfn8_thermalpad2.4x3mm_thermalpadcenteroffsetx-0.2mm_thermalpadcenteroffsety0.35mm"
  const soup = fp.string(footprint).circuitJson()
  const thermalPad = soup.find(
    (element) =>
      element.type === "pcb_smtpad" &&
      element.port_hints.includes("thermalpad"),
  )

  expect(thermalPad).toMatchObject({
    shape: "rect",
    x: -0.2,
    y: 0.35,
    width: 2.4,
    height: 3,
  })

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "dfn8_offset_thermalpad",
  )
})

test("C473374 DFN supports a rotated notched thermal pad", () => {
  const footprint =
    "dfn12_thermalpad2.54mmx3.302mm_thermalpadnotchtopbottom2.032mmx0.635mm_p0.4mm_w4.8mm_pw0.2mm_pl0.85mm_pin1location(leftside,bottom)"
  const soup = fp.string(footprint).circuitJson()
  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  const thermalPad = pads.find((pad) => pad.port_hints.includes("thermalpad"))

  expect(pads).toHaveLength(13)
  expect(thermalPad).toMatchObject({
    shape: "polygon",
    port_hints: ["thermalpad"],
    points: c473374ThermalPadPoints,
  })

  const builderSoup = fp()
    .dfn(12)
    .thermalpad("2.54mmx3.302mm")
    .thermalpadnotchtopbottom("2.032mmx0.635mm")
    .p("0.4mm")
    .w("4.8mm")
    .pw("0.2mm")
    .pl("0.85mm")
    .pin1location("leftside", "bottom")
    .circuitJson()
  const builderThermalPad = builderSoup.find(
    (element) =>
      element.type === "pcb_smtpad" &&
      element.port_hints.includes("thermalpad"),
  )
  expect(builderThermalPad).toEqual(thermalPad)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "c473374_notched_dfn")
})

test("left/right thermal pad notches use footprint-local axes", () => {
  const footprint =
    "dfn12_thermalpad3.302mmx2.54mm_thermalpadnotchleftright0.635mmx2.032mm_p0.4mm_w4.8mm_pw0.2mm_pl0.85mm"
  const soup = fp.string(footprint).circuitJson()
  const thermalPad = soup.find(
    (element) =>
      element.type === "pcb_smtpad" &&
      element.port_hints.includes("thermalpad"),
  )

  expect(thermalPad).toMatchObject({
    shape: "polygon",
    port_hints: ["thermalpad"],
    points: c473374ThermalPadPoints,
  })

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "dfn12_left_right_notched_thermalpad",
  )
})

test("thermal pad notches validate their orientation and dimensions", () => {
  expect(() =>
    fp
      .string(
        "dfn12_thermalpad2.54mmx3.302mm_thermalpadnotchtopbottom2.032mmx0.635mm_thermalpadnotchleftright0.635mmx2.032mm",
      )
      .circuitJson(),
  ).toThrow(
    "thermalpadnotchtopbottom and thermalpadnotchleftright cannot be combined",
  )

  expect(() =>
    fp
      .string(
        "dfn12_thermalpad2.54mmx3.302mm_thermalpadnotchtopbottom2.54mmx0.635mm",
      )
      .circuitJson(),
  ).toThrow("top/bottom thermalpad notches")

  expect(() =>
    fp
      .string(
        "dfn12_thermalpad3.302mmx2.54mm_thermalpadnotchleftright1.651mmx2.032mm",
      )
      .circuitJson(),
  ).toThrow("left/right thermalpad notches")

  expect(() =>
    fp
      .string(
        "dfn12_thermalpad2.54mmx3.302mm_thermalpadnotchtopbottom-1mmx0.635mm",
      )
      .circuitJson(),
  ).toThrow("thermalpad notch dimensions must be positive")

  expect(() =>
    fp.string("dfn12_thermalpadnotchtopbottom2.032mmx0.635mm").circuitJson(),
  ).toThrow("thermalpad notch dimensions require thermalpad dimensions")
})
