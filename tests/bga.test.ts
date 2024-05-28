import test from "ava"
import { fp } from "../src/footprinter"
import { AnySoupElement } from "@tscircuit/soup"
import { toPinPositionString } from "./fixtures"

test("bga footprint", (t) => {
  const soup = fp().bga().pins(16).size("4mm", "4mm").grid(8, 8).p(1.27).soup()
  // 16pins, 4mm x 4mm, 8x8 grid, 1.27mm pitch
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1 : -0.50  0.00
2 :  0.50  0.00
  `.trim()
  )
})
