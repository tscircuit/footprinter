import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { fp } from "../src/footprinter"

test("all origins produce same physical pad positions with missing center", () => {
  const configs = [
    fp().bga(8).grid("3x3").p(1).missing("center").soup(),
    fp().bga(8).grid("3x3").p(1).missing("center").blorigin(true).soup(),
    fp().bga(8).grid("3x3").p(1).missing("center").brorigin(true).soup(),
    fp().bga(8).grid("3x3").p(1).missing("center").trorigin(true).soup(),
  ]

  const allPositions = configs.map((soup) => {
    const pads = soup.filter(
      (el): el is PcbSmtPad => el.type === "pcb_smtpad",
    )
    expect(pads).toHaveLength(8)

    const pinNums = pads
      .map((p) => Number(p.port_hints?.[0]))
      .sort((a, b) => a - b)
    expect(pinNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

    return pads
      .map((p) => ({ x: p.x, y: p.y }))
      .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x))
  })

  for (let i = 1; i < allPositions.length; i++) {
    for (let j = 0; j < allPositions[0]!.length; j++) {
      expect(allPositions[i]![j]!.x).toBe(allPositions[0]![j]!.x)
      expect(allPositions[i]![j]!.y).toBe(allPositions[0]![j]!.y)
    }
  }
})
