import test from "ava"
import { fp } from "../src/footprinter"
import { toPinPositionString } from "./fixtures"

test("cap footprint", (t) => {
  const soup = fp().cap().imperial("0402").soup()
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1 : -0.50  0.00
2 :  0.50  0.00
  `.trim()
  )
})

test("cap_imperial0402", (t) => {
  const soup = fp.string("cap_imperial0402").soup()
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1 : -0.50  0.00
2 :  0.50  0.00
  `.trim()
  )
})
