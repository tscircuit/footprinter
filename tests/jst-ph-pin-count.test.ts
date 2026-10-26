import { expect, test } from "bun:test"
import { fp } from "../src/index"

test("JST PH compact and delimited strings produce correct pin counts", () => {
  const ph4_a = fp.string("jst_ph_4").circuitJson()
  const ph4_b = fp.string("jst_ph4").circuitJson()
  const ph4_c = fp.string("jst4_ph").circuitJson()
  const ph4_d = fp.string("jst4ph").circuitJson()

  for (const c of [ph4_a, ph4_b, ph4_c, ph4_d]) {
    const pads = c.filter(
      (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
    )
    expect(pads.length).toBe(4)
  }
})

test("JST SH, ZH, XH compact and delimited strings produce correct pin counts", () => {
  const sh6 = fp.string("jst_sh6").circuitJson()
  const sh6_pads = sh6.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )
  // JST SH has 6 signal pads + 2 mounting pads = 8
  expect(sh6_pads.length).toBe(8)

  const xh3 = fp.string("jst_xh3").circuitJson()
  const xh3_pads = xh3.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )
  expect(xh3_pads.length).toBe(3)

  const zh5 = fp.string("jst_zh5").circuitJson()
  const zh5_pads = zh5.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )
  expect(zh5_pads.length).toBe(5)
})
