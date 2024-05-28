import type { AnySoupElement, PCBSMTPad } from "@tscircuit/soup"
import { rectpad } from "../helpers/rectpad"
import { PassiveDef, passive } from "../helpers/passive-fn"

interface BgaDef {
  num_pins: number
  grid: [number, number]
  pitch: number
  width: number
  height: number

  ball_diameter?: number
  pad_size?: number
}

export const bga = (params: BgaDef): AnySoupElement[] => {
  const soup: AnySoupElement[] = []

  let { num_pins, grid, pitch, width, height, ball_diameter, pad_size } = params

  ball_diameter ??= (0.75 / 1.27) * pitch

  pad_size ??= ball_diameter * 0.8

  const pads: PCBSMTPad[] = []

  for (let i = 0; i < num_pins; i++) {
    // const xpos = pads
    //   .push
    //   // rectpad(i+1,
    //   ()
  }

  return soup
}
