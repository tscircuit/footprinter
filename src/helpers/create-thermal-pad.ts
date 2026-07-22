import type { PcbSmtPad } from "circuit-json"
import { rectpad } from "./rectpad"

export const createThermalPad = (dimensions: {
  x: number
  y: number
}): PcbSmtPad => rectpad(["thermalpad"], 0, 0, dimensions.x, dimensions.y)
