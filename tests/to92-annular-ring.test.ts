import { expect, test } from "bun:test"
import type { PcbPlatedHole } from "circuit-json"
import { fp } from "../src/footprinter"

// JLCPCB's smallest listed annular ring for plated through holes
const MIN_ANNULAR_RING = 0.13

const getMinAnnularRing = (hole: PcbPlatedHole): number => {
  if (hole.shape === "circle") {
    return (hole.outer_diameter - hole.hole_diameter) / 2
  }
  if (hole.shape === "circular_hole_with_rect_pad") {
    return (
      (Math.min(hole.rect_pad_width, hole.rect_pad_height) -
        hole.hole_diameter) /
      2
    )
  }
  if (hole.shape === "pill") {
    return (
      Math.min(
        hole.outer_width - hole.hole_width,
        hole.outer_height - hole.hole_height,
      ) / 2
    )
  }
  throw new Error(`Unexpected plated hole shape: ${hole.shape}`)
}

for (const footprint of [
  "to92",
  "to92_2",
  "to92_inline",
  "to92s",
  "to92s_2",
  "to92s_3",
]) {
  test(`${footprint} default pads leave a manufacturable annular ring`, () => {
    const platedHoles = fp
      .string(footprint)
      .circuitJson()
      .filter(
        (element): element is PcbPlatedHole =>
          element.type === "pcb_plated_hole",
      )

    expect(platedHoles.length).toBeGreaterThan(0)
    for (const hole of platedHoles) {
      expect(getMinAnnularRing(hole)).toBeGreaterThanOrEqual(MIN_ANNULAR_RING)
    }
  })
}
