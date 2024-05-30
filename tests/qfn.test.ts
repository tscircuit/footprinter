import test from "ava"
import { fp } from "../src/footprinter"
import { AnySoupElement } from "@tscircuit/soup"
import { toPinPositionString } from "./fixtures"

test("qfn16_w4_h4_p0.65mm", (t) => {
  const soup = fp.string("qfn16_w4_h4_p0.65mm").soup()
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1 : -1.95  1.95
2 : -0.65  1.95
3 :  0.65  1.95
4 :  1.95  1.95
5 :  1.95  0.65
6 :  1.95 -0.65
7 :  1.95 -1.95
8 :  0.65 -1.95
9 : -0.65 -1.95
10: -1.95 -1.95
11: -1.95 -0.65
12: -1.95  0.65
13: -0.65  0.65
14:  0.65  0.65
15:  0.65 -0.65
16: -0.65 -0.65
  `.trim()
  )
})
