import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getPads = (soup: any[]) =>
  soup.filter((el): el is PcbSmtPad => el.type === "pcb_smtpad")

const getPinNums = (pads: PcbSmtPad[]) =>
  pads.map((p) => Number(p.port_hints?.[0])).sort((a, b) => a - b)

test("bga missing center with blorigin renumbers pins correctly", () => {
  const soup = fp()
    .bga(8)
    .grid("3x3")
    .p(1)
    .missing("center")
    .blorigin(true)
    .soup()

  const pads = getPads(soup)
  expect(pads).toHaveLength(8)

  const pinNums = getPinNums(pads)
  // Should be consecutively renumbered 1-8 with no gaps or zeroes
  expect(pinNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

  // Pin 1 should be at bottom-left (A1)
  const pin1 = pads.find((p) => p.port_hints?.[0] === "1")
  expect(pin1?.x).toBe(-1)
  expect(pin1?.y).toBe(1)
  expect(pin1?.port_hints?.[1]).toBe("A1")

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga_3x3_blorigin_missing_center",
  )
})

test("bga missing center with brorigin renumbers pins correctly", () => {
  const soup = fp()
    .bga(8)
    .grid("3x3")
    .p(1)
    .missing("center")
    .brorigin(true)
    .soup()

  const pads = getPads(soup)
  expect(pads).toHaveLength(8)

  const pinNums = getPinNums(pads)
  expect(pinNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

  // Pin 1 should be at bottom-right (A1)
  const pin1 = pads.find((p) => p.port_hints?.[0] === "1")
  expect(pin1?.x).toBe(1)
  expect(pin1?.y).toBe(1)
  expect(pin1?.port_hints?.[1]).toBe("A1")

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga_3x3_brorigin_missing_center",
  )
})

test("bga missing center with trorigin renumbers pins correctly", () => {
  const soup = fp()
    .bga(8)
    .grid("3x3")
    .p(1)
    .missing("center")
    .trorigin(true)
    .soup()

  const pads = getPads(soup)
  expect(pads).toHaveLength(8)

  const pinNums = getPinNums(pads)
  expect(pinNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

  // Pin 1 should be at top-right (A1)
  const pin1 = pads.find((p) => p.port_hints?.[0] === "1")
  expect(pin1?.x).toBe(1)
  expect(pin1?.y).toBe(-1)
  expect(pin1?.port_hints?.[1]).toBe("A1")

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga_3x3_trorigin_missing_center",
  )
})

test("bga missing specific pin with blorigin via string", () => {
  // 3x3 grid, blorigin, missing B2 (center)
  // With blorigin: B2 is grid position (1,1) → pin_y=1, pin_x=1 → pin 5
  const soup = fp.string("bga8_grid3x3_p1_missing(B2)_blorigin").circuitJson()

  const pads = getPads(soup)
  expect(pads).toHaveLength(8)

  const pinNums = getPinNums(pads)
  expect(pinNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga_3x3_blorigin_missing_B2",
  )
})

test("all origins produce same physical pad positions with missing center", () => {
  const origins = [
    { name: "tl", opts: {} },
    { name: "bl", opts: { blorigin: true } },
    { name: "br", opts: { brorigin: true } },
    { name: "tr", opts: { trorigin: true } },
  ] as const

  const allPadPositions: Array<Array<{ x: number; y: number }>> = []

  for (const origin of origins) {
    let builder = fp().bga(8).grid("3x3").p(1).missing("center")
    if ("blorigin" in origin.opts) builder = builder.blorigin(true)
    if ("brorigin" in origin.opts) builder = builder.brorigin(true)
    if ("trorigin" in origin.opts) builder = builder.trorigin(true)

    const soup = builder.soup()
    const pads = getPads(soup)

    // All should have exactly 8 pads
    expect(pads).toHaveLength(8)

    // All should have pins 1-8
    const pinNums = getPinNums(pads)
    expect(pinNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

    // Collect sorted physical positions
    const positions = pads
      .map((p) => ({ x: p.x, y: p.y }))
      .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x))
    allPadPositions.push(positions)
  }

  // All origins should produce the same set of physical positions
  for (let i = 1; i < allPadPositions.length; i++) {
    for (let j = 0; j < allPadPositions[0]!.length; j++) {
      expect(allPadPositions[i]![j]!.x).toBe(allPadPositions[0]![j]!.x)
      expect(allPadPositions[i]![j]!.y).toBe(allPadPositions[0]![j]!.y)
    }
  }
})
