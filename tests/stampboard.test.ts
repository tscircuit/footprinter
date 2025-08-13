import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("stampboard", () => {
  const soup = fp
    .string("stampboard_left20_right20_bottom3_top2_w21mm_p2.54mm_innerhole")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "stampboard_left20_right20_bottom3_top2_w21mm_p2.54mm_innerhole",
  )
})
test("stampboard", () => {
  const soup = fp
    .string("stampboard_left10_right10_bottom4_top0_w21mm_p2.54mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "stampboard_left10_right10_bottom4_top0_w21mm_p2.54mm",
  )
})

test("stampboard silkscreen labels", () => {
  const def =
    "stampboard_left10_right10_bottom4_top4_w21mm_p2.54mm_silkscreenlabels"
  const soup = fp.string(def).circuitJson()
  const params = fp.string(def).json() as any
  const silkscreenTexts = soup.filter(
    (el) =>
      el.type === "pcb_silkscreen_text" &&
      el.pcb_silkscreen_text_id?.startsWith("pin_"),
  ) as any[]
  expect(silkscreenTexts.length).toBe(28)

  const triangle = soup.find(
    (el) =>
      el.type === "pcb_silkscreen_path" &&
      el.pcb_silkscreen_path_id === "pcb_silkscreen_triangle_1",
  )
  expect(triangle).toBeUndefined()

  const wHalf = params.w / 2
  const hHalf = (Math.max(params.left, params.right) * params.p) / 2
  expect(
    silkscreenTexts.every(
      (t) =>
        Math.abs(t.anchor_position?.x ?? 0) < wHalf &&
        Math.abs(t.anchor_position?.y ?? 0) < hHalf,
    ),
  ).toBe(true)

  const pos = (n: number) =>
    silkscreenTexts.find((t) => t.text === `pin${n}`)!.anchor_position

  // pin1 should be on the left side at the top
  const pin1 = pos(1)
  expect(pin1.x).toBeLessThan(0)
  expect(pin1.y).toBeGreaterThan(0)

  for (let i = 1; i < params.left; i++) {
    const current = pos(i)
    const next = pos(i + 1)
    expect(next.y).toBeLessThan(current.y)
    expect(next.x).toBeCloseTo(current.x, 3)
  }

  const bottomFirst = params.left + 1
  const bottomLast = params.left + (params.bottom ?? 0)
  for (let pin = bottomFirst; pin < bottomLast; pin++) {
    const current = pos(pin)
    const next = pos(pin + 1)
    expect(next.x).toBeGreaterThan(current.x)
    expect(next.y).toBeCloseTo(current.y, 3)
  }

  const rightFirst = params.left + (params.bottom ?? 0) + 1
  const rightLast = rightFirst + params.right - 1
  for (let pin = rightFirst; pin < rightLast; pin++) {
    const current = pos(pin)
    const next = pos(pin + 1)
    expect(next.y).toBeGreaterThan(current.y)
    expect(next.x).toBeCloseTo(current.x, 3)
  }

  const topFirst = params.left + params.bottom + params.right + 1
  const topLast = topFirst + params.top - 1
  for (let pin = topFirst; pin < topLast; pin++) {
    const current = pos(pin)
    const next = pos(pin + 1)
    expect(next.x).toBeLessThan(current.x)
    expect(next.y).toBeCloseTo(current.y, 3)
  }

  const bottomStart = params.left + 1
  const bottomEnd = params.left + (params.bottom ?? 0)
  const topStart = params.left + params.right + (params.bottom ?? 0) + 1

  const bottomTexts = silkscreenTexts.filter((t) => {
    const idx = Number(t.text?.replace("pin", ""))
    return idx >= bottomStart && idx <= bottomEnd
  })
  const topTexts = silkscreenTexts.filter((t) => {
    const idx = Number(t.text?.replace("pin", ""))
    return idx >= topStart
  })
  expect(bottomTexts.every((t) => t.ccw_rotation === 90)).toBe(true)
  expect(topTexts.every((t) => t.ccw_rotation === 270)).toBe(true)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "stampboard_left10_right10_bottom4_top4_w21mm_p2.54mm_silkscreenlabels",
  )

  const soupMargin = fp.string(`${def}_silkscreenlabelmargin1mm`).circuitJson()
  const silkscreenTextsMargin = soupMargin.filter(
    (el) =>
      el.type === "pcb_silkscreen_text" &&
      el.pcb_silkscreen_text_id?.startsWith("pin_"),
  ) as any[]
  const pin1Default = silkscreenTexts.find(
    (t) => t.text === "pin1",
  )!.anchor_position
  const pin1Margin = silkscreenTextsMargin.find(
    (t) => t.text === "pin1",
  )!.anchor_position
  expect(pin1Margin.x - pin1Default.x).toBeCloseTo(0.8, 3)

  const pinTopDefault = silkscreenTexts.find(
    (t) => t.text === `pin${topFirst}`,
  )!.anchor_position
  const pinTopMargin = silkscreenTextsMargin.find(
    (t) => t.text === `pin${topFirst}`,
  )!.anchor_position
  expect(pinTopDefault.y - pinTopMargin.y).toBeCloseTo(0.8, 3)
})
