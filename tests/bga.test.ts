import test from "ava"
import { fp } from "../src/footprinter"
import { AnySoupElement } from "@tscircuit/soup"
import { toPinPositionString } from "./fixtures"

test("bga footprint", (t) => {
  const soup = fp()
    .bga(8)
    .w("4mm")
    .h("4mm")
    .grid("3x3")
    .missing("center")
    .p(1)
    .soup()
  // 16pins, 4mm x 4mm, 8x8 grid, 1.27mm pitch
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1 : -1.00  1.00
2 :  0.00  1.00
3 :  1.00  1.00
4 : -1.00  0.00
6 :  1.00  0.00
7 : -1.00 -1.00
8 :  0.00 -1.00
9 :  1.00 -1.00
  `.trim()
  )
})
