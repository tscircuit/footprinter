import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const diodeLikeFootprints = [
  "diode0402",
  "led0402",
  "led2835",
  "led5050",
  "melf",
  "micromelf",
  "minimelf",
  "sma",
  "smb",
  "smbf",
  "smc",
  "smf",
  "sod110",
  "sod123",
  "sod123f",
  "sod123fl",
  "sod123w",
  "sod128",
  "sod323",
  "sod323f",
  "sod323fl",
  "sod323w",
  "sod523",
  "sod723",
  "sod80",
  "sod882",
  "sod882d",
  "sod923",
  "do219ad",
  "sod323he",
  "smdpads2_p3mm_pw1mm_ph1mm_anodepin2_cathodepin1",
]

test("Footprinter leaves automatic diode and LED polarity artwork to core", async () => {
  const previews: string[] = []
  for (const [index, footprintName] of diodeLikeFootprints.entries()) {
    const circuitJson = fp.string(footprintName).circuitJson()
    expect(
      circuitJson.filter(
        (element) =>
          element.type === "pcb_fabrication_note_path" ||
          element.type === "pcb_fabrication_note_text",
      ),
    ).toHaveLength(0)
    expect(
      circuitJson.some(
        (element) =>
          element.type === "pcb_smtpad" || element.type === "pcb_plated_hole",
      ),
    ).toBe(true)
    const svg = convertCircuitJsonToPcbSvg(circuitJson, {
      width: 300,
      height: 220,
      showFabricationNotes: true,
      showCourtyards: true,
    })
    const displayName = footprintName.startsWith("smdpads2")
      ? "smdpads2 (explicit A/K)"
      : footprintName
    previews.push(
      `<g transform="translate(${(index % 4) * 300},${Math.floor(index / 4) * 250})"><text x="150" y="20" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14">${displayName}</text>${svg.replace("<svg", '<svg y="30"')}</g>`,
    )
  }
  // Pin-number annotations are fabrication notes too, but they are not polarity
  // artwork and remain part of the DIP footprint.
  expect(
    fp
      .string("dip8")
      .circuitJson()
      .filter((element) => element.type === "pcb_fabrication_note_text"),
  ).toHaveLength(8)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="2000" viewBox="0 0 1200 2000"><rect width="1200" height="2000" fill="black"/>${previews.join("")}</svg>`
  await expect(svg).toMatchSvgSnapshot(import.meta.path)
})
