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

test("qfn64 thermal pad supports a configurable 4x4 via grid", () => {
  const soup = fp
    .string(
      "qfn64_thermalpad6.3mmx6.3mm_thermalvias4x4_thermalviapitch1mm_thermalviaid0.3048mm_thermalviaod0.6096mm_pillpads_h9.67mm_pw0.28mm_pl0.66mm",
    )
    .circuitJson()
  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  const vias = soup.filter((element) => element.type === "pcb_via")

  expect(pads).toHaveLength(65)
  expect(vias).toHaveLength(16)
  expect(vias.map(({ x, y }) => [x, y])).toEqual(
    [-1.5, -0.5, 0.5, 1.5].flatMap((y) =>
      [-1.5, -0.5, 0.5, 1.5].map((x) => [x, y]),
    ),
  )
  expect(
    vias.every(
      (via) =>
        via.hole_diameter === 0.3048 &&
        via.outer_diameter === 0.6096 &&
        via.layers[0] === "top" &&
        via.layers[1] === "bottom",
    ),
  ).toBe(true)

  expect(convertCircuitJsonToPcbSvg(soup)).toMatchSvgSnapshot(
    import.meta.path,
    "qfn64_thermalpad_4x4_thermalvias",
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

test("qfn10 supports wider left and right pads for C128396", () => {
  const soup = fp
    .string(
      "qfn10_leftpins1_toppins4_rightpins1_bottompins4_px0.5mm_w2.4999864mm_h2.075264mm_pw0.2500122mm_pl0.5249926mm_leftrightpadwidth0.2999994mm_leftrightpadlength0.580009mm_rounded0",
    )
    .circuitJson()
  const aliasSoup = fp
    .string(
      "qfn10_leftpins1_toppins4_rightpins1_bottompins4_px0.5mm_w2.4999864mm_h2.075264mm_pw0.2500122mm_pl0.5249926mm_lrpw0.2999994mm_lrpl0.580009mm_rounded0",
    )
    .circuitJson()
  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  const leftRightPads = pads.filter((pad) => Math.abs(pad.x) > 0.8)
  const topBottomPads = pads.filter((pad) => Math.abs(pad.y) > 0.6)

  expect(leftRightPads).toHaveLength(2)
  expect(leftRightPads[0]).toMatchObject({
    width: 0.580009,
    height: 0.2999994,
  })
  expect(topBottomPads).toHaveLength(8)
  expect(topBottomPads[0]).toMatchObject({
    width: 0.2500122,
    height: 0.5249926,
  })
  expect(pads.every((pad) => pad.corner_radius === 0)).toBe(true)
  expect(aliasSoup).toEqual(soup)

  expect(convertCircuitJsonToPcbSvg(soup)).toMatchSvgSnapshot(
    import.meta.path,
    "qfn10_c128396_left_right_pad_overrides",
  )
})
