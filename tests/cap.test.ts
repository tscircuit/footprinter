import test from "ava"
import { fp } from "../src/footprinter"
import { AnySoupElement } from "@tscircuit/soup"
import { toPinPositionString } from "./fixtures"

test("cap footprint", (t) => {
  const soup = fp().cap().p(1).soup()
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1 :  0.50  0.00
2 :  0.50  0.00
  `.trim()
  )
})
