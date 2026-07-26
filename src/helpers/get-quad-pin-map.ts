import type { PinOrderSpecifier } from "./zod/pin-order-specifier"

/**
 * A counter-clockwise pin map is [1,2,3,4,5,6,7,8] for an 8-pin package
 *
 *     8 7
 *   1     6
 *   2     5
 *     3 4
 *
 * Given some parameters, we're returning how to map the pins in a quad package
 * with a different order. For example, if we pass in cw=true, we'll get the
 * following mapping
 *
 * 1 -> 1
 * 2 -> 8
 * 3 -> 7
 * 4 -> 6
 * 5 -> 5
 * 6 -> 4
 * 7 -> 3
 * 8 -> 2
 *
 * Which allows us to create the CW version of the package using...
 * new_pin = pin_map[normal_ccw_pin]
 *
 *    2 3
 *  1     4
 *  8     5
 *    7 6
 */
export const getQuadPinMap = ({
  num_pins,
  sidepins,
  cw,
  ccw,
  startingpin,
}: {
  num_pins: number
  sidepins?: { x: number; y: number }
  cw?: boolean
  ccw?: boolean
  startingpin?: PinOrderSpecifier[]
}): number[] => {
  const pin_map: number[] = []
  const verticalSidePinCount = sidepins?.x ?? num_pins / 4
  const horizontalSidePinCount = sidepins?.y ?? num_pins / 4
  const leftBottomPin = verticalSidePinCount
  const bottomLeftPin = leftBottomPin + 1
  const bottomRightPin = verticalSidePinCount + horizontalSidePinCount
  const rightBottomPin = bottomRightPin + 1
  const rightTopPin = verticalSidePinCount * 2 + horizontalSidePinCount
  const topRightPin = rightTopPin + 1
  let current_position_ccw_normal = 1

  /** Starting Flag Pins */
  const sfp: Record<PinOrderSpecifier, boolean> = {} as any
  for (const specifier of startingpin ?? []) {
    sfp[specifier] = true
  }
  if (!sfp.leftside && !sfp.topside && !sfp.rightside && !sfp.bottomside) {
    sfp.leftside = true
  }
  if (!sfp.bottompin && !sfp.leftpin && !sfp.rightpin && !sfp.toppin) {
    if (sfp.leftside) {
      sfp.toppin = true
    } else if (sfp.topside) {
      sfp.rightpin = true
    } else if (sfp.rightside) {
      sfp.bottompin = true
    } else if (sfp.bottomside) {
      sfp.leftpin = true
    }
  }

  if (sfp.leftside && sfp.toppin) {
    current_position_ccw_normal = 1
  } else if (sfp.leftside && sfp.bottompin) {
    current_position_ccw_normal = leftBottomPin
  } else if (sfp.bottomside && sfp.leftpin) {
    current_position_ccw_normal = bottomLeftPin
  } else if (sfp.bottomside && sfp.rightpin) {
    current_position_ccw_normal = bottomRightPin
  } else if (sfp.rightside && sfp.bottompin) {
    current_position_ccw_normal = rightBottomPin
  } else if (sfp.rightside && sfp.toppin) {
    current_position_ccw_normal = rightTopPin
  } else if (sfp.topside && sfp.rightpin) {
    current_position_ccw_normal = topRightPin
  } else if (sfp.topside && sfp.leftpin) {
    current_position_ccw_normal = num_pins
  }

  pin_map.push(-1) // the first index is meaningless

  // Each iteration we move the current position to the next pin, if we're
  // going CCW this means incrementing, if we're going CW this means
  // decrementing
  for (let i = 0; i < num_pins; i++) {
    pin_map[current_position_ccw_normal] = i + 1
    if (ccw || !cw) {
      current_position_ccw_normal++
      if (current_position_ccw_normal > num_pins) {
        current_position_ccw_normal = 1
      }
    } else {
      current_position_ccw_normal--
      if (current_position_ccw_normal < 1) {
        current_position_ccw_normal = num_pins
      }
    }
  }

  return pin_map
}
