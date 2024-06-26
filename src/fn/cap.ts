import type { AnySoupElement } from "@tscircuit/soup"
import { rectpad } from "../helpers/rectpad"
import { PassiveDef, passive } from "../helpers/passive-fn"

export const cap = (params: PassiveDef): AnySoupElement[] => {
  return passive(params)
}
