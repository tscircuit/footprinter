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
  const size = footprintSizes.find(
    (s) => s.metric === imperialOrMetric || s.imperial === imperialOrMetric,
  )
  if (!size) throw new Error(`Footprint size not found for ${imperialOrMetric}`)

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

  // Sort pads left-to-right by x
  const [leftPad, rightPad] = kicadPads.sort((a, b) => a.x - b.x)
  const kicadPadSpacing = Math.abs(rightPad!.x - leftPad!.x)

  console.log(`Comparing footprint sizes for ${normalizedFootprintName}:`)
  console.log(`- Stored pad-to-pad spacing (p_mm_min): ${size.p_mm_min}`)
  console.log(`- Stored pad width (pw_mm_min): ${size.pw_mm_min}`)
  console.log(`- Stored pad height (ph_mm_min): ${size.ph_mm_min}`)
  console.log(`- Stored body width (w_mm_min): ${size.w_mm_min}`)
  console.log(`- Stored body height (h_mm_min): ${size.h_mm_min}`)
  console.log(`- KiCad pad-to-pad spacing: ${kicadPadSpacing}`)
  console.log(
    `- KiCad pad 1 width: ${leftPad!.width}, height: ${leftPad!.height}`,
  )
  console.log(
    `- KiCad pad 2 width: ${rightPad!.width}, height: ${rightPad!.height}`,
  )
  console.log(`- KiCad body width: ${pcbComp.width}, height: ${pcbComp.height}`)

  const padSpacingDiff = diff(kicadPadSpacing, size.p_mm_min)
  const padWidthDiff =
    diff(leftPad!.width, size.pw_mm_min) + diff(rightPad!.width, size.pw_mm_min)
  const padHeightDiff =
    diff(leftPad!.height, size.ph_mm_min) +
    diff(rightPad!.height, size.ph_mm_min)
  const bodyWidthDiff = diff(pcbComp.width, size.w_mm_min)
  const bodyHeightDiff = diff(pcbComp.height, size.h_mm_min)

  const totalDiff =
    padSpacingDiff +
    padWidthDiff +
    padHeightDiff +
    bodyWidthDiff +
    bodyHeightDiff
  console.log(`Total difference: ${totalDiff}`)

  return totalDiff
}
