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

  const wHalf = params.w / 2
  const hHalf = (Math.max(params.left, params.right) * params.p) / 2
  expect(
    silkscreenTexts.every(
      (t) =>
        Math.abs(t.anchor_position?.x ?? 0) < wHalf &&
        Math.abs(t.anchor_position?.y ?? 0) < hHalf,
    ),
  ).toBe(true)

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
})
