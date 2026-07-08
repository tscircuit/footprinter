import type { AnySoupElement } from "circuit-json"
import { passive, type PassiveDef } from "src/helpers/passive-fn"
import { createFabricationNoteDiode } from "../helpers/create-fabrication-note-diode"

const getCopperBounds = (circuitJson: AnySoupElement[]) => {
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const element of circuitJson) {
    if (element.type === "pcb_smtpad") {
      minX = Math.min(minX, element.x - element.width / 2)
      maxX = Math.max(maxX, element.x + element.width / 2)
      minY = Math.min(minY, element.y - element.height / 2)
      maxY = Math.max(maxY, element.y + element.height / 2)
    }

    if (element.type === "pcb_plated_hole") {
      minX = Math.min(minX, element.x - element.outer_diameter / 2)
      maxX = Math.max(maxX, element.x + element.outer_diameter / 2)
      minY = Math.min(minY, element.y - element.outer_diameter / 2)
      maxY = Math.max(maxY, element.y + element.outer_diameter / 2)
    }
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxY)
  ) {
    throw new Error("Could not determine diode copper bounds")
  }

  return { minX, maxX, minY, maxY }
}

export const diode = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  const circuitJson = passive({ ...parameters, roundedPads: true })

  return {
    circuitJson: circuitJson.concat(
      createFabricationNoteDiode(getCopperBounds(circuitJson)),
    ),
    parameters,
  }
}
