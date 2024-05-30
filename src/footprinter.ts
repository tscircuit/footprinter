import { dip } from "./fn/dip"
import { diode } from "./fn/diode"
import { cap } from "./fn/cap"
import { led } from "./fn/led"
import { res } from "./fn/res"
import { bga } from "./fn/bga"
import { soic } from "./fn/soic"
import { quad } from "./fn/quad"
import { qfn } from "./fn/qfn"
import type { AnySoupElement } from "@tscircuit/soup"
import { isNotNull } from "./helpers/is-not-null"

export type FootprinterParamsBuilder<K extends string> = {
  [P in K | "params" | "soup"]: P extends "params" | "soup"
    ? Footprinter[P]
    : (v?: number | string) => FootprinterParamsBuilder<K>
}

type CommonPassiveOptionKey =
  | "metric"
  | "imperial"
  | "tht"
  | "p"
  | "pw"
  | "ph"
  | "w"
  | "h"

export type Footprinter = {
  dip: (
    num_pins: number
  ) => FootprinterParamsBuilder<"w" | "p" | "id" | "od" | "wide" | "narrow">
  cap: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  res: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  diode: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  led: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  lr: (num_pins: number) => FootprinterParamsBuilder<"w" | "l" | "pl" | "pr">
  quad: (
    num_pins: number
  ) => FootprinterParamsBuilder<
    "w" | "l" | "square" | "pl" | "pr" | "pb" | "pt" | "p" | "pw" | "ph"
  >
  bga: (
    num_pins: number
  ) => FootprinterParamsBuilder<
    "grid" | "p" | "w" | "h" | "ball" | "pad" | "missing"
  >
  qfn: (
    num_pins: number
  ) => FootprinterParamsBuilder<"w" | "h" | "p">
  soic: (num_pins: number) => FootprinterParamsBuilder<"w" | "p" | "id" | "od">
  params: () => any
  soup: () => AnySoupElement[]
}

export const string = (def: string): Footprinter => {
  let fp = footprinter()

  const def_parts = def
    .split("_")
    .map((s) => {
      const m = s.match(/([a-z]+)([\(\d\.\+\?].*)?/)
      const [_, fn, v] = m ?? []
      if (v?.includes("?")) return null
      return { fn: m?.[1]!, v: m?.[2]! }
    })
    .filter(isNotNull)

  for (const { fn, v } of def_parts) {
    fp = fp[fn](v)
  }

  return fp
}

export const footprinter = (): Footprinter & { string: typeof string } => {
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
          if ("bga" in target) return () => bga(target)
          if ("soic" in target) return () => soic(target)
          if ("quad" in target) return () => quad(target)
          if ("qfn" in target) return () => qfn(target)

          return () => {
            // TODO improve error
            throw new Error(
              `No function found for footprinter, make sure to specify .dip, .lr, .p, etc. Got \"${prop}\"`
            )
          }
        }
        if (prop === "params") {
          // TODO
          return () => target
        }
        return (v: any) => {
          if (Object.keys(target).length === 0) {
            target[prop] = true
            if (prop === "res" || prop === "cap") {
              if (v) {
                target.imperial = v // res0402, cap0603 etc.
              }
            } else {
              target.num_pins = parseFloat(v)
            }
          } else {
            target[prop] = v ?? true
          }
          return proxy
        }
      },
    }
  )
  return proxy as any
}
footprinter.string = string

export const fp = footprinter
