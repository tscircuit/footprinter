import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("soic8_w5.3mm_p1.27mm", () => {
  const soup = fp.string("soic8_w5.3mm_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_w5.3mm_p1.27mm",
  )
})
test("soic8", () => {
  const soup = fp.string("soic8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soic8")
})

test("soic28", () => {
  const soup = fp
    .string("soic28_pw0.762_pl1.524_pillpads_w11.2_p1.3")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "soic28_pw0762_pl1524",
  )
})

test("soic8 with pill pads", () => {
  const soup = fp().soic(8).pw("0.4").pl("1").pillpads(true).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_pw04_pl1_pillpads",
  )

  // Verify pads are pill-shaped
  const pads = soup.filter((el) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(8)
  expect(pads[0]?.shape).toBe("pill")

  const firstPad = pads[0]
  if (firstPad && firstPad.shape === "pill") {
    expect(firstPad.radius).toBe(firstPad.height / 2)
  }
})

test("soic8 toe extends pads past the body edge", () => {
  const soup = fp
    .string("soic8_w3.9mm_p1.27mm_pl1.95mm_pw0.6mm_toe1.5mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soic8_toe")

  // Pad center sits at body edge + toe - pl/2: 1.95 + 1.5 - 0.975 = 2.475
  const pads = soup.filter((el) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(8)
  for (const pad of pads) {
    expect(Math.abs(pad.x)).toBeCloseTo(2.475)
  }

  // Silkscreen never lands on pads: side lines are clipped into pad gaps
  const silks = soup.filter((el) => el.type === "pcb_silkscreen_path")
  for (const silk of silks) {
    for (let i = 0; i < silk.route.length - 1; i++) {
      const a = silk.route[i]
      const b = silk.route[i + 1]
      for (let t = 0; t <= 1; t += 0.05) {
        const x = a.x + (b.x - a.x) * t
        const y = a.y + (b.y - a.y) * t
        for (const pad of pads) {
          const inside =
            Math.abs(x - pad.x) < pad.width / 2 &&
            Math.abs(y - pad.y) < pad.height / 2
          expect(inside).toBe(false)
        }
      }
    }
  }
})
