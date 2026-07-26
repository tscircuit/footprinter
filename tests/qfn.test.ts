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

test("qfn20_sidepins2x8 supports unequal side counts and pitches", () => {
  const soup = fp
    .string(
      "qfn20_sidepins2x8_px0.5mm_py1.5mm_w5.55mm_h4.55mm_pw0.28mm_pl0.85mm_thermalpad2.7x1.7mm_startingpin(leftside,bottompin)",
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

  expect(perimeterPads).toHaveLength(20)
  expect(leftRightPads).toHaveLength(4)
  expect(topBottomPads).toHaveLength(16)
  expect(pin1?.x).toBeCloseTo(-2.25)
  expect(pin1?.y).toBeCloseTo(-0.75)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn20_sidepins2x8_separate_pitches_thermalpad",
  )
})
