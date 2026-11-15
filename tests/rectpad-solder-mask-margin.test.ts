import { expect, test } from "bun:test"
import { rectpad } from "../src/helpers/rectpad"

test("rectpad supports solder_mask_margin and covered_with_solder_mask options", () => {
  const padFromOptionsObject = rectpad(1, 0, 0, 1.2, 0.8, {
    cornerRadius: 0.1,
    solder_mask_margin: -0.05,
    covered_with_solder_mask: true,
  })

  expect(padFromOptionsObject).toMatchObject({
    type: "pcb_smtpad",
    shape: "rect",
    x: 0,
    y: 0,
    width: 1.2,
    height: 0.8,
    corner_radius: 0.1,
    solder_mask_margin: -0.05,
    is_covered_with_solder_mask: true,
    port_hints: ["1"],
  })

  const padFromTrailingOpts = rectpad(["1", "a1"], 1, 2, 1.5, 1.0, 0.2, {
    solder_mask_margin: 0.05,
    covered_with_solder_mask: false,
  })

  expect(padFromTrailingOpts).toMatchObject({
    type: "pcb_smtpad",
    shape: "rect",
    x: 1,
    y: 2,
    width: 1.5,
    height: 1.0,
    corner_radius: 0.2,
    solder_mask_margin: 0.05,
    is_covered_with_solder_mask: false,
    port_hints: ["1", "a1"],
  })
})
