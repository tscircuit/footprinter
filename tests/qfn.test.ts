import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("qfn32", () => {
  const soup = fp.string("qfn32").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "qfn32")
})

test("qfn32_pillpads keeps its thermal pad rectangular", () => {
  const soup = fp.string("qfn32_pillpads_thermalpad3.1x3.1mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  const perimeterPads = pads.filter(
    (pad) => !pad.port_hints.includes("thermalpad"),
  )
  const thermalPad = pads.find((pad) => pad.port_hints.includes("thermalpad"))

  expect(perimeterPads).toHaveLength(32)
  expect(perimeterPads.every((pad) => pad.shape === "pill")).toBe(true)
  expect(
    perimeterPads.every(
      (pad) => pad.radius === Math.min(pad.width, pad.height) / 2,
    ),
  ).toBe(true)
  expect(thermalPad?.shape).toBe("rect")
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn32_pillpads_thermalpad3.1x3.1mm",
  )
})

test("qfn thermal pad supports independent x and y offsets", () => {
  const soup = fp
    .string(
      "qfn32_thermalpad3.1x3.1mm_thermalpadcenteroffsetx0.25mm_thermalpadcenteroffsety-0.4mm",
    )
    .circuitJson()
  const thermalPad = soup.find(
    (element) =>
      element.type === "pcb_smtpad" &&
      element.port_hints.includes("thermalpad"),
  )

  expect(thermalPad).toMatchObject({
    shape: "rect",
    x: 0.25,
    y: -0.4,
    width: 3.1,
    height: 3.1,
  })

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn32_offset_thermalpad",
  )
})

test("qfn20 supports explicit and shared side pin counts", () => {
  const soup = fp
    .string(
      "qfn20_leftpins2_toppins8_rightpins2_bottompins8_px0.5mm_py1.5mm_w5.55mm_h4.55mm_pw0.28mm_pl0.85mm_thermalpad2.7x1.7mm_startingpin(leftside,bottompin)",
    )
    .circuitJson()
  const shortAliasSoup = fp
    .string(
      "qfn20_lrpins2_tbpins8_px0.5mm_py1.5mm_w5.55mm_h4.55mm_pw0.28mm_pl0.85mm_thermalpad2.7x1.7mm_startingpin(leftside,bottompin)",
    )
    .circuitJson()
  const longAliasSoup = fp
    .string(
      "qfn20_leftrightpins2_topbottompins8_px0.5mm_py1.5mm_w5.55mm_h4.55mm_pw0.28mm_pl0.85mm_thermalpad2.7x1.7mm_startingpin(leftside,bottompin)",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  const perimeterPads = pads.filter(
    (pad) => !pad.port_hints.includes("thermalpad"),
  )
  const leftRightPads = perimeterPads.filter((pad) => pad.width > pad.height)
  const topBottomPads = perimeterPads.filter((pad) => pad.height > pad.width)
  const pin1 = perimeterPads.find((pad) => pad.port_hints.includes("1"))
  const padsFrom = (circuitJson: typeof soup) =>
    circuitJson.filter(
      (element) =>
        element.type === "pcb_smtpad" || element.type === "pcb_plated_hole",
    )

  expect(perimeterPads).toHaveLength(20)
  expect(leftRightPads).toHaveLength(4)
  expect(topBottomPads).toHaveLength(16)
  expect(pin1?.x).toBeCloseTo(-2.25)
  expect(pin1?.y).toBeCloseTo(-0.75)
  expect(padsFrom(shortAliasSoup)).toEqual(padsFrom(soup))
  expect(padsFrom(longAliasSoup)).toEqual(padsFrom(soup))
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn20_explicit_side_pins_separate_pitches_thermalpad",
  )
})

test("qfn20 supports independently sized sides", () => {
  const soup = fp
    .string(
      "qfn20_leftpins2_toppins7_rightpins3_bottompins8_px0.5mm_py1mm_w5.55mm_h4.55mm_pw0.28mm_pl0.85mm_thermalpad2.7x1.7mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  const perimeterPads = soup.filter(
    (element) =>
      element.type === "pcb_smtpad" &&
      !element.port_hints.includes("thermalpad"),
  )
  const leftPads = perimeterPads.filter(
    (pad) => pad.width > pad.height && pad.x < 0,
  )
  const topPads = perimeterPads.filter(
    (pad) => pad.height > pad.width && pad.y > 0,
  )
  const rightPads = perimeterPads.filter(
    (pad) => pad.width > pad.height && pad.x > 0,
  )
  const bottomPads = perimeterPads.filter(
    (pad) => pad.height > pad.width && pad.y < 0,
  )

  expect(leftPads).toHaveLength(2)
  expect(topPads).toHaveLength(7)
  expect(rightPads).toHaveLength(3)
  expect(bottomPads).toHaveLength(8)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn20_independent_side_pins",
  )
})
