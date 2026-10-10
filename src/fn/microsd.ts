import type { AnyCircuitElement } from "circuit-json"
import { z } from "zod"
import { hardKeepoutRect } from "../helpers/hard-keepout-rect"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"

export const microsd_def = base_def.extend({
  fn: z.literal("microsd"),
  num_pins: z.literal(11).default(11),
  dm3at: z.literal(true).describe("Hirose DM3AT-SF-PEJM5 mounting pattern"),
})

export const microsd = (
  rawParams: z.input<typeof microsd_def>,
): {
  circuitJson: AnyCircuitElement[]
  parameters: z.output<typeof microsd_def>
} => {
  const parameters = microsd_def.parse(rawParams)
  const clean = (value: number) => Number(value.toFixed(12))

  // Hirose EDC-325165-00-00 p1 (2024-09-02), component-side land pattern.
  // Contact 1 center is the datum. All vertical drawing dimensions below
  // reference the contact lands' bottom, not their center.
  const contactPitch = 1.1
  const contactWidth = 0.7
  const contactHeight = 1.2
  const rowBottom = -contactHeight / 2
  const contacts = Array.from({ length: 8 }, (_, index) =>
    rectpad(
      index + 1,
      clean(-index * contactPitch),
      0,
      contactWidth,
      contactHeight,
    ),
  )

  const leftLandRight = -9.1
  const leftLandWidth = 1
  const leftLandCenter = leftLandRight - leftLandWidth / 2
  // Detect B and A are separate isolated switch contacts; four shell lands
  // share a single conductive shell owner 11.
  const detectB = rectpad(9, -8.65, 0, contactWidth, contactHeight)
  const detectA = rectpad(
    10,
    leftLandCenter,
    clean(rowBottom - 9.9),
    leftLandWidth,
    0.8,
  )
  const rearShell = rectpad(11, 1.55, 0, 1, contactHeight)
  const leftUpperShellY = clean(rowBottom - 3.7)
  const leftLowerShellY = clean(rowBottom - 14.05)
  const leftUpperShell = rectpad(
    11,
    leftLandCenter,
    leftUpperShellY,
    leftLandWidth,
    1.2,
  )
  const leftLowerShell = rectpad(
    11,
    leftLandCenter,
    leftLowerShellY,
    leftLandWidth,
    2.8,
  )
  const frontRightShell = rectpad(
    11,
    clean(leftLandRight + 9.1 + 3.25 + 1.3 / 2),
    clean(rowBottom - 14.5),
    1.3,
    1.9,
  )

  // Drawing note 3: "No patterns are permitted in this oblique-hatched area."
  // Split the outer-left strip around its solder land. The interior L-shaped
  // region is exactly a vertical strip plus its horizontal crossbar.
  const outerLeft = -10
  const outerRight = -9.25
  const outerTop = rowBottom + 0.15
  const upperShellTop = leftUpperShellY + 1.2 / 2
  const upperShellBottom = leftUpperShellY - 1.2 / 2
  const outerBottom = rowBottom - 7.9
  const innerLeft = -8.9
  const innerRight = -8.2
  const innerTop = rowBottom - 5.7
  const innerBottom = rowBottom - 13.3
  const crossbarTop = rowBottom - 4.4
  const crossbarBottom = rowBottom - 6
  const crossbarRight = 0.5
  const frontLeft = 0.15
  const frontRight = 2.7
  const frontTop = rowBottom - 14.1
  const frontBottom = leftLowerShellY - 2.8 / 2
  const region = (left: number, right: number, bottom: number, top: number) =>
    hardKeepoutRect(
      clean((left + right) / 2),
      clean((bottom + top) / 2),
      clean(right - left),
      clean(top - bottom),
    )
  const keepouts = [
    region(outerLeft, outerRight, upperShellTop, outerTop),
    region(outerLeft, outerRight, outerBottom, upperShellBottom),
    region(innerLeft, innerRight, innerBottom, innerTop),
    region(innerRight, crossbarRight, crossbarBottom, crossbarTop),
    region(frontLeft, frontRight, frontBottom, frontTop),
  ]

  return {
    circuitJson: [
      ...contacts,
      detectB,
      detectA,
      rearShell,
      leftUpperShell,
      leftLowerShell,
      frontRightShell,
      ...keepouts,
    ],
    parameters,
  }
}
