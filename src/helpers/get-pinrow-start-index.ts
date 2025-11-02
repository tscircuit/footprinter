import type { PinOrderSpecifier } from "./zod/pin-order-specifier"

export function getPinrowStartIndex({
  positions,
  rows,
  numPinsPerRow,
  startingpin,
}: {
  positions: Array<{ row: number; col: number }>
  rows: number
  numPinsPerRow: number
  startingpin?: PinOrderSpecifier[]
}): number {
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

  let targetRow: number | undefined
  let targetCol: number | undefined

  if (sfp.toppin) targetRow = 0
  else if (sfp.bottompin) targetRow = rows - 1

  if (sfp.leftpin) targetCol = 0
  else if (sfp.rightpin) targetCol = numPinsPerRow - 1

  if (targetRow === undefined) {
    if (sfp.topside) targetRow = 0
    else if (sfp.bottomside) targetRow = rows - 1
  }
  if (targetCol === undefined) {
    if (sfp.leftside) targetCol = 0
    else if (sfp.rightside) targetCol = numPinsPerRow - 1
  }

  const idx = positions.findIndex(
    (p) => p.row === targetRow && p.col === targetCol,
  )
  return idx === -1 ? 0 : idx
}
