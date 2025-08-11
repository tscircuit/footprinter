import { test, expect } from "bun:test"
import { silkscreenPin } from "../src/helpers/silkscreenPin"

test("silkscreenPin anchorplacement top uses bottom_center alignment", () => {
  const res = silkscreenPin({
    fs: 1,
    pn: 1,
    anchor_x: 0,
    anchor_y: 0,
    anchorplacement: "top",
  })
  expect(res.anchor_alignment).toBe("bottom_center")
})

test("silkscreenPin anchorplacement bottom uses top_center alignment", () => {
  const res = silkscreenPin({
    fs: 1,
    pn: 1,
    anchor_x: 0,
    anchor_y: 0,
    anchorplacement: "bottom",
  })
  expect(res.anchor_alignment).toBe("top_center")
})
