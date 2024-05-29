import test from "ava"
import { fp } from "../src/footprinter"
import { AnySoupElement } from "@tscircuit/soup"
import { toPinPositionString } from "./fixtures"

test("quad footprint", (t) => {
  const soup = fp().quad(16).w(4).l(4).p(0.5).soup()
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1 : -1.75 -2.00
2 : -1.25 -2.00
3 : -0.75 -2.00
4 : -0.25 -2.00
5 :  0.25 -2.00
6 :  0.75 -2.00
7 :  1.25 -2.00
8 :  1.75 -2.00
9 :  2.00 -1.75
10:  2.00 -1.25
11:  2.00 -0.75
12:  2.00 -0.25
13:  2.00  0.25
14:  2.00  0.75
15:  2.00  1.25
16:  2.00  1.75
  `.trim()
  )
})

test("quad16_w4_l4_p0.5", (t) => {
  const soup = fp.string("quad16_w4_l4_p0.5").soup()
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1 : -1.75 -2.00
2 : -1.25 -2.00
3 : -0.75 -2.00
4 : -0.25 -2.00
5 :  0.25 -2.00
6 :  0.75 -2.00
7 :  1.25 -2.00
8 :  1.75 -2.00
9 :  2.00 -1.75
10:  2.00 -1.25
11:  2.00 -0.75
12:  2.00 -0.25
13:  2.00  0.25
14:  2.00  0.75
15:  2.00  1.25
16:  2.00  1.75
  `.trim()
  )
})
