import type { AnySoupElement } from "@tscircuit/soup"
import { rectpad } from "../helpers/rectpad"
import { passive } from "../helpers/passive-fn"

export const cap = (params: {
  tht: boolean
  p: number
  pw?: number
  ph?: number
  metric?: string
  imperial?: string
  w?: number
  h?: number
}): AnySoupElement[] => {
  return passive(params)
}
