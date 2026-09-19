import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { PcbSmtPad } from "circuit-json"
import { fp } from "../src/footprinter"

const isSignalPad = (p: PcbSmtPad) =>
  p.port_hints?.some((h) => /^\d+$/.test(h)) ?? false

test("utdfn4ep matches the KiCad UDFN-4-1EP_1x1mm_P0.65mm_EP0.48x0.48mm pad geometry", () => {
  const soup = fp.string("utdfn4ep").circuitJson()
  const pads = soup.filter(
    (e): e is PcbSmtPad => e.type === "pcb_smtpad" && e.shape === "rect",
  )

  const signalPads = pads
    .filter(isSignalPad)
    .sort((a, b) => Number(a.port_hints?.[0]) - Number(b.port_hints?.[0]))

  expect(signalPads).toHaveLength(4)
  for (const pad of signalPads) {
    if (pad.shape !== "rect") throw new Error("expected rect pad")
    expect(pad.width).toBeCloseTo(0.22)
    expect(pad.height).toBeCloseTo(0.25)
  }
  const padXY = (p: PcbSmtPad) => {
    if (!("x" in p) || !("y" in p)) throw new Error("pad has no x/y")
    return [p.x, p.y]
  }
  expect(signalPads.map(padXY)).toEqual([
    [-0.54, 0.325],
    [-0.54, -0.325],
    [0.54, -0.325],
    [0.54, 0.325],
  ])

  const thermalPad = pads.find((p) => p.port_hints?.includes("thermalpad"))
  if (!thermalPad || thermalPad.shape !== "rect") {
    throw new Error("expected a rect thermal pad")
  }
  expect(thermalPad.x).toBeCloseTo(0)
  expect(thermalPad.y).toBeCloseTo(0)
  expect(thermalPad.width).toBeCloseTo(0.48)
  expect(thermalPad.height).toBeCloseTo(0.48)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4ep")
})

test("utdfn accepts an explicit pin count", () => {
  const soup = fp.string("utdfn6").circuitJson()
  const signalPads = soup.filter(
    (e): e is PcbSmtPad => e.type === "pcb_smtpad" && isSignalPad(e),
  )
  expect(signalPads).toHaveLength(6)
})
