import type { PcbSmtPad } from "circuit-json"

/**
 * A single electrical SMD annulus, without a plated drill. Circuit JSON
 * polygon pads cannot contain holes; four touching sectors retain an actual
 * copper-free opening without relying on SVG fill rules. Each quadrant uses
 * 32 chords. Maximum radial departure is radius * (1 - cos(pi / 128)); total
 * annular area departure is below 0.0402%. All sectors share the same pin.
 */
export const annularpad = (
  pin: number,
  x: number,
  y: number,
  innerDiameter: number,
  outerDiameter: number,
): PcbSmtPad[] => {
  const steps = 32
  return Array.from({ length: 4 }, (_, quadrant) => {
    const point = (index: number, radius: number) => {
      const angle = ((quadrant + index / steps) * Math.PI) / 2
      return {
        x: x + radius * Math.cos(angle),
        y: y + radius * Math.sin(angle),
      }
    }
    return {
      type: "pcb_smtpad",
      pcb_smtpad_id: `annular_${pin}_sector_${quadrant + 1}`,
      shape: "polygon",
      layer: "top",
      port_hints: [String(pin)],
      points: [
        ...Array.from({ length: steps + 1 }, (_, i) =>
          point(i, outerDiameter / 2),
        ),
        ...Array.from({ length: steps + 1 }, (_, i) =>
          point(steps - i, innerDiameter / 2),
        ),
      ],
    }
  })
}
