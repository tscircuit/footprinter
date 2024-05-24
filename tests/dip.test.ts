import test from "ava"
import { fp } from "../src/footprinter"
import { AnySoupElement } from "@tscircuit/soup"

test("dip params", (t) => {
  t.deepEqual(fp().dip(4).w(7.62).params(), {
    dip: 4,
    w: 7.62,
  })
})

const toPinPositionString = (soup: AnySoupElement[]) => {
  return soup
    .map((e) => {
      if (e.type === "pcb_plated_hole") {
        return {
          x: e.x,
          y: e.y,
          pn: e.port_hints?.[0],
        }
      }
      // TODO other types
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.pn - b.pn)
    .map((e: any) => `${e.pn}: ${e.x.toFixed(2)},${e.y.toFixed(2)}`)
    .join("\n")
}

test("dip footprint", (t) => {
  const soup = fp().dip(4).w(4).p(2).soup()
  const ps = toPinPositionString(soup)

  t.is(
    ps,
    `
1: -2,1
2: -2,-1
3: 2,-1
4: 2,1
  `.trim()
  )
})
