export interface QuadSidePinCounts {
  left: number
  top: number
  right: number
  bottom: number
}

export interface QuadSidePinCountInput {
  num_pins: number
  leftpins?: number
  toppins?: number
  rightpins?: number
  bottompins?: number
  lrpins?: number
  leftrightpins?: number
  tbpins?: number
  topbottompins?: number
}

const resolveSharedCount = (
  shortName: string,
  shortValue: number | undefined,
  longName: string,
  longValue: number | undefined,
) => {
  if (
    shortValue !== undefined &&
    longValue !== undefined &&
    shortValue !== longValue
  ) {
    throw new Error(
      `Conflicting ${shortName} (${shortValue}) and ${longName} (${longValue})`,
    )
  }
  return longValue ?? shortValue
}

export const getQuadSidePinCounts = (
  parameters: QuadSidePinCountInput,
): QuadSidePinCounts => {
  const leftRightPins = resolveSharedCount(
    "lrpins",
    parameters.lrpins,
    "leftrightpins",
    parameters.leftrightpins,
  )
  const topBottomPins = resolveSharedCount(
    "tbpins",
    parameters.tbpins,
    "topbottompins",
    parameters.topbottompins,
  )
  const defaultSidePinCount = parameters.num_pins / 4
  const sidePinCounts = {
    left: parameters.leftpins ?? leftRightPins ?? defaultSidePinCount,
    top: parameters.toppins ?? topBottomPins ?? defaultSidePinCount,
    right: parameters.rightpins ?? leftRightPins ?? defaultSidePinCount,
    bottom: parameters.bottompins ?? topBottomPins ?? defaultSidePinCount,
  }
  const hasExplicitSidePinCounts = [
    parameters.leftpins,
    parameters.toppins,
    parameters.rightpins,
    parameters.bottompins,
    parameters.lrpins,
    parameters.leftrightpins,
    parameters.tbpins,
    parameters.topbottompins,
  ].some((value) => value !== undefined)

  if (hasExplicitSidePinCounts) {
    const entries = Object.entries(sidePinCounts)
    const invalidEntry = entries.find(
      ([, value]) => !Number.isInteger(value) || value < 1,
    )
    if (invalidEntry) {
      throw new Error(
        `Quad ${invalidEntry[0]} pin count must be a positive integer, got ${invalidEntry[1]}`,
      )
    }

    const total = entries.reduce((sum, [, value]) => sum + value, 0)
    if (total !== parameters.num_pins) {
      throw new Error(
        `Quad side pin counts left=${sidePinCounts.left}, top=${sidePinCounts.top}, right=${sidePinCounts.right}, bottom=${sidePinCounts.bottom} require ${total} pins, got ${parameters.num_pins}`,
      )
    }
  }

  return sidePinCounts
}
