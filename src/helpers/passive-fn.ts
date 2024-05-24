import type { AnySoupElement } from "@tscircuit/soup"
import { rectpad } from "../helpers/rectpad"

export const passive = (params: {
  tht: boolean
  p: number
  pw?: number
  ph?: number
  metric?: string
  imperial?: string
  w?: number
  h?: number
}): AnySoupElement[] => {
  let { tht, p, pw, ph, metric, imperial, w, h } = params

  if (h! > w!) {
    throw new Error(
      "height cannot be greater than width (rotated footprint not yet implemented)"
    )
  }

  pw = pw ?? (w! - p) / 2
  ph = ph ?? h!

  if (tht) {
    throw new Error("through hole capacitors not implemented")
  } else {
    return [
      rectpad(-p / 2 - pw / 2, 0, pw, ph),
      rectpad(p / 2 + pw / 2, 0, pw, ph),
    ]
  }
}
