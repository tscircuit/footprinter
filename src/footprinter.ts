import { dip } from "./fn/dip"
import { diode } from "./fn/diode"
import { cap } from "./fn/cap"
import { led } from "./fn/led"
import { res } from "./fn/res"
import { AnySoupElement } from "@tscircuit/soup"

export type FootprinterParamsBuilder<K extends string> = {
  [P in K | "params" | "soup"]: P extends "params" | "soup"
    ? Footprinter[P]
    : (v?: number | string) => FootprinterParamsBuilder<K>
}

type CommonPassiveOptionKey = "metric" | "imperial" | "tht" | "p"

export type Footprinter = {
  dip: (num_pins: number) => FootprinterParamsBuilder<"w" | "p" | "id" | "od">
  cap: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  res: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  diode: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  led: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  lr: (num_pins: number) => FootprinterParamsBuilder<"w" | "l" | "pl" | "pr">
  quad: (
    num_pins: number
  ) => FootprinterParamsBuilder<
    "w" | "l" | "square" | "pl" | "pr" | "pb" | "pt" | "p"
  >
  params: () => any
  soup: () => AnySoupElement[]
}

export const footprinter = (): Footprinter => {
  const proxy = new Proxy(
    {},
    {
      get: (target: any, prop) => {
        if (prop === "soup") {
          if ("dip" in target) return () => dip(target)
          if ("diode" in target) return () => diode(target)
          if ("cap" in target) return () => cap(target)
          if ("led" in target) return () => led(target)
          if ("res" in target) return () => res(target)

          return () => {
            // TODO improve error
            throw new Error(
              "No function found for footprinter, make sure to specify .dip, .lr, .p, etc."
            )
          }
        }
        if (prop === "params") {
          // TODO
          return () => target
        }
        return (v: any) => {
          target[prop] = v ?? true
          return proxy
        }
      },
    }
  )
  return proxy as any
}

export const fp = footprinter
