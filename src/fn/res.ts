import type { AnySoupElement } from "@tscircuit/soup"
import { passive, type PassiveDef } from "../helpers/passive-fn"

export const res = (params: PassiveDef): AnySoupElement[] => {
  return passive(params)
}
