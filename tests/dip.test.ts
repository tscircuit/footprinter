import test from "ava"
import { fp } from "../src/footprinter"
import { AnySoupElement } from "@tscircuit/soup"
import { toPinPositionString } from "./fixtures"

test("dip params", (t) => {
  t.deepEqual(fp().dip(4).w(7.62).params(), {
    dip: 4,
    w: 7.62,
  })
})

test("dip footprint", (t) => {
  const soup = fp().dip(4).w(4).p(2).soup()
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1 : -2.00  1.00
2 : -2.00 -1.00
3 :  2.00 -1.00
4 :  2.00  1.00
  `.trim()
  )
})
