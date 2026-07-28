import type { PcbSmtPad } from "circuit-json"
import { length } from "circuit-json"
import { rectpad } from "./rectpad"

export const thermalPadOffsetFields = {
  thermalpadx: length.optional().default(0),
  thermalpady: length.optional().default(0),
}

export const createThermalPad = (
  dimensions: {
    x: number
    y: number
  },
  offset: {
    x: number
    y: number
  },
): PcbSmtPad =>
  rectpad(["thermalpad"], offset.x, offset.y, dimensions.x, dimensions.y)
