import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { fp } from "../src/footprinter"

test("thermalpadmask sets negative soldermask_margin for solder-mask-defined thermal pad on QFN/quad", () => {
  const soup = fp
    .string("qfn32_w10_h10_p0.5mm_thermalpad(8x8)_thermalpadmask(6.5x6.5)")
    .circuitJson()

  const pads = soup.filter((el): el is PcbSmtPad => el.type === "pcb_smtpad")
  const thermalPad = pads.find((pad) => pad.port_hints?.includes("thermalpad"))

  expect(thermalPad).toBeDefined()
  if (thermalPad && thermalPad.shape === "rect") {
    expect(thermalPad.width).toBeCloseTo(8, 5)
    expect(thermalPad.height).toBeCloseTo(8, 5)
    expect(thermalPad.soldermask_margin).toBeCloseTo(-0.75, 5)
  }
})

test("padmask and soldermaskmargin support solder-mask-defined signal and thermal pads", () => {
  const soup = fp
    .string(
      "tqfp32_w7_h7_p0.8mm_pw0.4_pl1.2_padmask(0.3x1.0)_thermalpad(4x4)_thermalpadsoldermaskmargin-0.4mm",
    )
    .circuitJson()

  const pads = soup.filter((el): el is PcbSmtPad => el.type === "pcb_smtpad")
  const signalPads = pads.filter(
    (pad) => !pad.port_hints?.includes("thermalpad"),
  )
  const thermalPad = pads.find((pad) => pad.port_hints?.includes("thermalpad"))

  expect(signalPads.length).toBe(32)
  for (const pad of signalPads) {
    if (pad.shape === "rect") {
      expect(pad.soldermask_margin).toBeCloseTo(-0.1, 5)
      if (pad.width < pad.height) {
        expect(pad.soldermask_margin_left).toBeCloseTo(-0.05, 5)
        expect(pad.soldermask_margin_right).toBeCloseTo(-0.05, 5)
        expect(pad.soldermask_margin_top).toBeCloseTo(-0.1, 5)
        expect(pad.soldermask_margin_bottom).toBeCloseTo(-0.1, 5)
      } else {
        expect(pad.soldermask_margin_left).toBeCloseTo(-0.1, 5)
        expect(pad.soldermask_margin_right).toBeCloseTo(-0.1, 5)
        expect(pad.soldermask_margin_top).toBeCloseTo(-0.05, 5)
        expect(pad.soldermask_margin_bottom).toBeCloseTo(-0.05, 5)
      }
    }
  }

  expect(thermalPad?.soldermask_margin).toBeCloseTo(-0.4, 5)
})
