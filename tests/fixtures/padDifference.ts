import { footprintSizes } from "src/helpers/passive-fn"

type PcbSmtPad = {
  type: "pcb_smtpad"
  x: number
  y: number
  width: number
  height: number
  port_hints: string[]
}

type PcbComponent = {
  type: "pcb_component"
  width: number
  height: number
}

const diff = (a: number, b: number) => Math.abs(a - b)

export async function padDifference(
  imperialOrMetric: string,
  footprintName: string,
): Promise<number> {
  // Find footprint size entry by matching imperial or metric code
  const size = footprintSizes.find(
    (s) => s.metric === imperialOrMetric || s.imperial === imperialOrMetric,
  )
  if (!size) throw new Error(`Footprint size not found for ${imperialOrMetric}`)

  // Normalize footprintName: remove "kicad:" prefix if present
  const normalizedFootprintName = footprintName.startsWith("kicad:")
    ? footprintName.slice(6)
    : footprintName

  console.log(`Fetching footprint data for: ${normalizedFootprintName}`)
  const url = `https://kicad-mod-cache.tscircuit.com/Resistor_SMD.pretty/${normalizedFootprintName}.circuit.json`
  const res = await fetch(url)
  if (!res.ok)
    throw new Error(`Failed to fetch ${normalizedFootprintName}: ${res.status}`)

  const data = (await res.json()) as any[]

  const kicadPads = data.filter((e) => e.type === "pcb_smtpad") as PcbSmtPad[]
  const pcbComp = data.find((e) => e.type === "pcb_component") as
    | PcbComponent
    | undefined

  if (!pcbComp)
    throw new Error(`No pcb_component found for ${normalizedFootprintName}`)
  if (kicadPads.length !== 2)
    throw new Error(
      `Expected 2 pads for ${normalizedFootprintName}, found ${kicadPads.length}`,
    )

  console.log(`Comparing footprint sizes for ${normalizedFootprintName}:`)
  console.log(`- Stored pad width (pw_mm_min): ${size.pw_mm_min}`)
  console.log(`- Stored pad height (ph_mm_min): ${size.ph_mm_min}`)
  console.log(`- Stored body width (w_mm_min): ${size.w_mm_min}`)
  console.log(`- Stored body height (h_mm_min): ${size.h_mm_min}`)

  console.log(
    `- KiCad pad 1 width: ${kicadPads[0]!.width}, height: ${kicadPads[0]!.height}`,
  )
  console.log(
    `- KiCad pad 2 width: ${kicadPads[1]!.width}, height: ${kicadPads[1]!.height}`,
  )
  console.log(`- KiCad body width: ${pcbComp.width}, height: ${pcbComp.height}`)

  const padWidthDiff =
    diff(kicadPads[0]!.width, size.pw_mm_min) +
    diff(kicadPads[1]!.width, size.pw_mm_min)
  const padHeightDiff =
    diff(kicadPads[0]!.height, size.ph_mm_min) +
    diff(kicadPads[1]!.height, size.ph_mm_min)
  const bodyWidthDiff = diff(pcbComp.width, size.w_mm_min)
  const bodyHeightDiff = diff(pcbComp.height, size.h_mm_min)

  const totalDiff =
    padWidthDiff + padHeightDiff + bodyWidthDiff + bodyHeightDiff
  console.log(`Total difference: ${totalDiff}`)

  return totalDiff
}
