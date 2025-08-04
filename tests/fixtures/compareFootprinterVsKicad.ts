import { transformPcbElements } from "@tscircuit/circuit-json-util"
import { translate } from "transformation-matrix"
import { fp } from "src/footprinter"
import type { PcbSilkscreenText } from "circuit-json"

type PcbSmtPad = {
  type: "pcb_smtpad"
  x: number
  y: number
  width: number
  height: number
  port_hints: string[]
}

export async function compareFootprinterVsKicad(
  footprinterString: string,
  kicadPath: string,
): Promise<{
  avgRelDiff: number
  combinedFootprintElements: any[]
}> {
  const BASE_URL = "https://kicad-mod-cache.tscircuit.com/"
  const kicadUrl = BASE_URL + kicadPath
  const normalizedFootprintName =
    kicadPath.split("/").pop()?.replace(".circuit.json", "") ?? "unknown"

  const res = await fetch(kicadUrl)
  if (!res.ok)
    throw new Error(`Failed to fetch ${normalizedFootprintName}: ${res.status}`)

  const kicadCircuitJson = (await res.json()) as any[]

  const kicadPads = kicadCircuitJson.filter(
    (e) => e.type === "pcb_smtpad",
  ) as PcbSmtPad[]

  const kicadArea = kicadPads.reduce(
    (sum, pad) => sum + (pad.width ?? 0) * (pad.height ?? 0),
    0,
  )

  const fpCircuitJson = fp.string(footprinterString).circuitJson()
  const referencePads = (fpCircuitJson as any[]).filter(
    (e) => e.type === "pcb_smtpad",
  ) as PcbSmtPad[]

  const refArea = referencePads.reduce(
    (sum, pad) => sum + (pad.width ?? 0) * (pad.height ?? 0),
    0,
  )

  const avgRelDiff = Math.abs(refArea - kicadArea) / (refArea + kicadArea) || 0
  const diffPercent = avgRelDiff * 100

  if (diffPercent > 0) {
    // 🔹 Estimate pitch (assumes pads aligned in 1D)
    if (kicadPads.length >= 2) {
      // Example: check if aligned horizontally (same y)
      const horizontal = kicadPads.every((pad) => pad.y === kicadPads[0]!.y)

      if (horizontal) {
        const sorted = [...kicadPads].sort((a, b) => a.x - b.x)
        const pitches: number[] = []
        for (let i = 1; i < sorted.length; i++) {
          const pitch = sorted[i]!.x - sorted[i - 1]!.x
          pitches.push(pitch)
        }
        const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length
        console.log(`📏 Horizontal pad pitch: ${avgPitch}`)
      } else {
        const sorted = [...kicadPads].sort((a, b) => a.y - b.y)
        const pitches: number[] = []
        for (let i = 1; i < sorted.length; i++) {
          const pitch = sorted[i]!.y - sorted[i - 1]!.y
          pitches.push(pitch)
        }
        const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length
        console.log(`📏 Vertical pad pitch: ${avgPitch}`)
      }
    }
    // 🟡 Log all KiCad pad sizes
    for (const pad of kicadPads) {
      console.log(`🔹 KiCad Pad - width: ${pad.width}, height: ${pad.height}`)
    }

    // 🟡 Log component width and height if present
    for (const e of kicadCircuitJson) {
      if (e.type === "pcb_component" && "width" in e && "height" in e) {
        console.log(
          `🟦 KiCad Component - width: ${e.width}, height: ${e.height}`,
        )
      }
    }
  }

  const kicadElements = kicadCircuitJson.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_component",
  )

  const refMaxX = Math.max(
    ...fpCircuitJson.map((e) =>
      "x" in e && "width" in e ? e.x + e.width / 2 : 0,
    ),
  )
  const refMinX = Math.min(
    ...fpCircuitJson.map((e) =>
      "x" in e && "width" in e ? e.x - e.width / 2 : 0,
    ),
  )
  const refWidth = refMaxX - refMinX

  const areaGapFactor = 1
  const dynamicExtraGap = Math.sqrt((refArea + kicadArea) * areaGapFactor)
  const dynamicGap = refWidth + dynamicExtraGap

  const transformedKiCad = transformPcbElements(
    kicadElements,
    translate(dynamicGap, 0),
  )

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const elm of [...fpCircuitJson, ...transformedKiCad]) {
    if (elm.type === "pcb_smtpad" && elm.shape === "rect") {
      minX = Math.min(minX, elm.x - elm.width / 2)
      maxX = Math.max(maxX, elm.x + elm.width / 2)
      minY = Math.min(minY, elm.y - elm.height / 2)
      maxY = Math.max(maxY, elm.y + elm.height / 2)
    }
  }

  const midX = (minX + maxX) / 2

  const diffPercentText: PcbSilkscreenText = {
    type: "pcb_silkscreen_text",
    pcb_silkscreen_text_id: "diffPercentText",
    pcb_component_id: "",
    font: "tscircuit2024",
    font_size: 0.3,
    text: `Diff: ${diffPercent.toFixed(2)}%`,
    layer: "top",
    anchor_position: {
      x: midX,
      y: -maxY - 1,
    },
    anchor_alignment: "center",
    ccw_rotation: 0,
    is_mirrored: false,
  }

  const combinedFootprintElements = [
    ...fpCircuitJson,
    ...transformedKiCad,
    diffPercentText,
  ]

  return {
    avgRelDiff,
    combinedFootprintElements,
  }
}
