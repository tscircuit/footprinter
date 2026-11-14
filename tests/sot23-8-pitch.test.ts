import { expect, test } from "bun:test"
import type { PcbSmtPadRect } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getPads = (footprint: string) =>
  fp
    .string(footprint)
    .circuitJson()
    .filter(
      (e): e is PcbSmtPadRect => e.type === "pcb_smtpad" && e.shape === "rect",
    )

test("sot23_8 uses the 0.65mm SOT-23-8 (JEDEC MO-178 BA) lead pitch", () => {
  const pads = getPads("sot23_8")
  expect(pads).toHaveLength(8)

  const leftColumn = pads.filter((pad) => pad.x < 0).sort((a, b) => b.y - a.y)
  expect(leftColumn).toHaveLength(4)
  for (let i = 1; i < leftColumn.length; i++) {
    expect(leftColumn[i - 1]!.y - leftColumn[i]!.y).toBeCloseTo(0.65)
  }

  // Adjacent pads must keep a solder-mask web between them.
  const gap = leftColumn[0]!.y - leftColumn[1]!.y - leftColumn[0]!.height
  expect(gap).toBeGreaterThanOrEqual(0.1)

  // SOT-23-6 keeps its 0.95mm pitch.
  const sot236Left = getPads("sot23_6")
    .filter((pad) => pad.x < 0)
    .sort((a, b) => b.y - a.y)
  expect(sot236Left[0]!.y - sot236Left[1]!.y).toBeCloseTo(0.95)

  expect(
    convertCircuitJsonToPcbSvg(fp.string("sot23_8").circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "sot23_8-pitch")
})
