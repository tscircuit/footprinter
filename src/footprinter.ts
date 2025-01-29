import * as FOOTPRINT_FN from "./fn"
import type { AnySoupElement } from "circuit-json"
import type { AnyCircuitElement } from "circuit-json"
import type { AnyFootprinterDefinitionOutput } from "./helpers/zod/AnyFootprinterDefinitionOutput"
import { isNotNull } from "./helpers/is-not-null"
import { footprintSizes } from "./helpers/passive-fn"

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
    num_pins?: number,
  ) => FootprinterParamsBuilder<"w" | "p" | "id" | "od" | "wide" | "narrow">
  cap: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  res: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  diode: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  led: () => FootprinterParamsBuilder<CommonPassiveOptionKey>
  lr: (num_pins?: number) => FootprinterParamsBuilder<"w" | "l" | "pl" | "pr">
  qfp: (
    num_pins?: number,
  ) => FootprinterParamsBuilder<"w" | "p" | "id" | "od" | "wide" | "narrow">
  quad: (
    num_pins?: number,
  ) => FootprinterParamsBuilder<
    "w" | "l" | "square" | "pl" | "pr" | "pb" | "pt" | "p" | "pw" | "ph"
  >
  bga: (
    num_pins?: number,
  ) => FootprinterParamsBuilder<
    "grid" | "p" | "w" | "h" | "ball" | "pad" | "missing"
  >
  qfn: (num_pins?: number) => FootprinterParamsBuilder<"w" | "h" | "p">
  soic: (num_pins?: number) => FootprinterParamsBuilder<"w" | "p" | "id" | "od">
  mlp: (num_pins?: number) => FootprinterParamsBuilder<"w" | "h" | "p">
  ssop: (num_pins?: number) => FootprinterParamsBuilder<"w" | "p">
  tssop: (num_pins?: number) => FootprinterParamsBuilder<"w" | "p">
  dfn: (num_pins?: number) => FootprinterParamsBuilder<"w" | "p">
  pinrow: (num_pins?: number) => FootprinterParamsBuilder<"p" | "id" | "od">
  axial: () => FootprinterParamsBuilder<"p" | "id" | "od">
  hc49: () => FootprinterParamsBuilder<"p" | "id" | "od" | "w" | "h">
  sot235: () => FootprinterParamsBuilder<"h" | "p" | "pl" | "pw">
  lqfp: (num_pins?: number) => FootprinterParamsBuilder<"w" | "h" | "pl" | "pw">
  pushbutton: () => FootprinterParamsBuilder<
    "tllabel" | "trlabel" | "bllabel" | "brlabel"
  >
  stampboard: () => FootprinterParamsBuilder<
    | "w"
    | "h"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "p"
    | "pw"
    | "pl"
    | "innerhole"
    | "innerholeedgedistance"
  >
  stampreceiver: () => FootprinterParamsBuilder<
    | "w"
    | "h"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "p"
    | "pw"
    | "pl"
    | "innerhole"
    | "innerholeedgedistance"
  >
  breakoutheaders: () => FootprinterParamsBuilder<
    "w" | "h" | "left" | "right" | "top" | "bottom" | "p" | "id" | "od"
  >

  params: () => any
  /** @deprecated use circuitJson() instead */
  soup: () => AnySoupElement[]
  circuitJson: () => AnyCircuitElement[]
  json: () => AnyFootprinterDefinitionOutput[]
  getFootprintNames: () => string[]
}

export const string = (def: string): Footprinter => {
  let fp = footprinter()

  // special case: 0402, 0603, etc.
  if ((def.length === 4 || def.length === 5) && /^\d+$/.test(def))
    def = `res${def}`

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

  fp.setString(def)

  return fp
}

export const getFootprintNames = (): string[] => {
  return Object.keys(FOOTPRINT_FN)
}

export const getFootprintSizes = (): typeof footprintSizes => {
  return footprintSizes
}

export const getFootprintNamesByType = (): {
  passiveFootprintNames: string[]
  normalFootprintNames: string[]
} => {
  const allFootprintNames = Object.keys(FOOTPRINT_FN)

  const passiveFootprintNames = allFootprintNames.filter((name) => {
    const fn = FOOTPRINT_FN[name]

    return fn.toString().includes("passive(")
  })

  return {
    passiveFootprintNames,
    normalFootprintNames: allFootprintNames.filter(
      (name) => !passiveFootprintNames.includes(name),
    ),
  }
}

export const footprinter = (): Footprinter & {
  string: typeof string
  getFootprintNames: string[]
  setString: (string) => void
} => {
  const proxy = new Proxy(
    {},
    {
      get: (target: any, prop: string) => {
        // console.log(prop, target)
        if (prop === "soup" || prop === "circuitJson") {
          if ("fn" in target && FOOTPRINT_FN[target.fn]) {
            return () => FOOTPRINT_FN[target.fn](target).circuitJson
          }

          if (!FOOTPRINT_FN[target.fn]) {
            throw new Error(
              `Invalid footprint function, got "${target.fn}"${
                target.string ? `, from string "${target.string}"` : ""
              }`,
            )
          }

          return () => {
            // TODO improve error
            throw new Error(
              `No function found for footprinter, make sure to specify .dip, .lr, .p, etc. Got "${prop}"`,
            )
          }
        }
        if (prop === "json") {
          if (!FOOTPRINT_FN[target.fn]) {
            throw new Error(
              `Invalid footprint function, got "${target.fn}"${
                target.string ? `, from string "${target.string}"` : ""
              }`,
            )
          }
          return () => FOOTPRINT_FN[target.fn](target).parameters
        }
        if (prop === "getFootprintNames") {
          return () => Object.keys(FOOTPRINT_FN)
        }
        if (prop === "params") {
          // TODO
          return () => target
        }
        if (prop === "setString") {
          return (v: string) => {
            target.string = v
            return proxy
          }
        }
        return (v: any) => {
          if (Object.keys(target).length === 0) {
            if (`${prop}${v}` in FOOTPRINT_FN) {
              target[`${prop}${v}`] = true
              target.fn = `${prop}${v}`
            } else {
              target[prop] = true
              target.fn = prop
              if (prop === "res" || prop === "cap") {
                if (v) {
                  target.imperial = v // res0402, cap0603 etc.
                }
              } else {
                target.num_pins = Number.isNaN(Number.parseFloat(v))
                  ? undefined
                  : Number.parseFloat(v)
              }
            }
          } else {
            // handle dip_w or other invalid booleans
            if (!v && ["w", "h", "p"].includes(prop as string)) {
              // ignore
            } else {
              target[prop] = v ?? true
            }
          }
          return proxy
        }
      },
    },
  )
  return proxy as any
}
footprinter.string = string
footprinter.getFootprintNames = getFootprintNames

export const fp = footprinter
