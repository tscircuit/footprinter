import type { AnySoupElement } from "@tscircuit/soup"
import { PassiveDef, passive } from "../helpers/passive-fn"

export const led = (params: PassiveDef): AnySoupElement[] => {
  return passive(params)
}
