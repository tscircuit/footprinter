import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { utdfn4ep } from "../src/fn/utdfn4ep"

test("utdfn4ep_default", () => {
  const { circuitJson } = utdfn4ep(undefined)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4ep_default")
})

test("utdfn4ep_overrides", () => {
  const { circuitJson } = utdfn4ep({
    pad_w: 0.4,
    pad_h: 0.5,
    ep_w: 0.7,
    ep_h: 0.7,
  })
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4ep_overrides")
})
