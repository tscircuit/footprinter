import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { led } from "../src/fn"
import { fp } from "../src/footprinter"

test("led_rect", () => {
  const soup = led({
    tht: false,
    p: 2.5,
    pw: 0.5,
    ph: 0.5,
  }).circuitJson

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_rect")
})
test("led_hole", () => {
  const soup = led({
    tht: true,
    p: 2,
    pw: 0.5,
    ph: 0.5,
    metric: "mm",
    w: 5,
    h: 2,
  }).circuitJson

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_hole")
})

test("led_rect testing .parameters for .json", async () => {
  const params = {
    tht: false,
    p: 2.5,
    pw: 0.5,
    ph: 0.5,
  }

  const soup = led(params)

  const soupJson = soup.circuitJson
  const soupParameters = soup.parameters

  const svgContent = convertCircuitJsonToPcbSvg(soupJson)

  expect(soupParameters).toEqual(params)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_rect")
})

test("led_hole testing .parameters for .json", async () => {
  const params = {
    tht: true,
    p: 2,
    pw: 0.5,
    ph: 0.5,
    metric: "mm",
    w: 5,
    h: 2,
  }

  const soup = led(params)

  const soupJson = soup.circuitJson
  const soupParameters = soup.parameters

  const svgContent = convertCircuitJsonToPcbSvg(soupJson)

  expect(soupParameters).toEqual(params)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_hole")
})

test("led_0402", () => {
  const soup = fp.string("0402").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_0402")
})

test("led_0603", () => {
  const soup = fp.string("0603").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_0603")
})

test("led_0805", () => {
  const soup = fp.string("0805").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_0805")
})

test("led_1206", () => {
  const soup = fp().led().imperial("1206").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_1206")
})
