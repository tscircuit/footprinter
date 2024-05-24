import type { AnySoupElement } from "@tscircuit/soup"
import { passive, PassiveDef } from "../helpers/passive-fn"

export const res = (params: PassiveDef): AnySoupElement[] => {
  return passive(params)
}
