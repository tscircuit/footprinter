import * as FOOTPRINT_FN from "./fn"
import type { AnySoupElement } from "circuit-json"
import type { AnyCircuitElement } from "circuit-json"
import type { AnyFootprinterDefinitionOutput } from "./helpers/zod/AnyFootprinterDefinitionOutput"
import { isNotNull } from "./helpers/is-not-null"
import { footprintSizes } from "./helpers/passive-fn"
import { applyOrigin } from "./helpers/apply-origin"
import { applyNoRefDes } from "./helpers/apply-norefdes"
import { applyNoSilkscreen } from "./helpers/apply-nosilkscreen"

type BaseOptionKey =
  | "origin"
  | "norefdes"
  | "invert"
  | "faceup"
  | "nosilkscreen"

export type FootprinterParamsBuilder<K extends string> = {
  [P in K | BaseOptionKey | "params" | "soup" | "circuitJson"]: P extends
    | "params"
    | "soup"
    | "circuitJson"
    ? Footprinter[P]
    : (v?: number | string | boolean) => FootprinterParamsBuilder<K>
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
  | "textbottom"

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
    | "grid"
    | "p"
    | "w"
    | "h"
    | "ball"
    | "pad"
    | "missing"
    | "tlorigin"
    | "blorigin"
    | "trorigin"
    | "brorigin"
    | "circularpads"
  >
  qfn: (num_pins?: number) => FootprinterParamsBuilder<"w" | "h" | "p">
  tqfp: (num_pins?: number) => FootprinterParamsBuilder<"w" | "h" | "p">
  soic: (
    num_pins?: number,
  ) => FootprinterParamsBuilder<
    "w" | "p" | "pw" | "pl" | "id" | "od" | "pillpads"
  >
  mlp: (num_pins?: number) => FootprinterParamsBuilder<"w" | "h" | "p">
  ssop: (num_pins?: number) => FootprinterParamsBuilder<"w" | "p">
  tssop: (num_pins?: number) => FootprinterParamsBuilder<"w" | "p">
  dfn: (num_pins?: number) => FootprinterParamsBuilder<"w" | "p">
  pinrow: (
    num_pins?: number,
  ) => FootprinterParamsBuilder<
    | "p"
    | "id"
    | "od"
    | "male"
    | "female"
    | "rows"
    | "smd"
    | "surfacemount"
    | "rightangle"
    | "pw"
    | "pl"
    | "pinlabeltextalignleft"
    | "pinlabeltextaligncenter"
    | "pinlabeltextalignright"
    | "pinlabelverticallyinverted"
    | "pinlabelorthogonal"
    | "nosquareplating"
    | "nopinlabels"
    | "doublesidedpinlabel"
    | "bottomsidepinlabel"
  >
  axial: () => FootprinterParamsBuilder<"p" | "id" | "od">
  radial: () => FootprinterParamsBuilder<
    "p" | "id" | "od" | "ceramic" | "electrolytic" | "polarized"
  >
  hc49: () => FootprinterParamsBuilder<"p" | "id" | "od" | "w" | "h">
  to220: () => FootprinterParamsBuilder<"w" | "h" | "p" | "id" | "od">
  sot363: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sot886: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sot457: () => FootprinterParamsBuilder<
    | "w"
    | "p"
    | "h"
    | "pl"
    | "pw"
    | "wave"
    | "reflow"
    | "pillr"
    | "pillh"
    | "pillw"
  >
  sot563: () => FootprinterParamsBuilder<"w" | "p" | "pl" | "pw">
  sot723: () => FootprinterParamsBuilder<"w" | "h" | "pl" | "pw" | "p">
  sot23: () => FootprinterParamsBuilder<"w" | "h" | "pl" | "pw">
  sot25: () => FootprinterParamsBuilder<"w" | "h" | "pl" | "pw">
  sot: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sot323: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sot89: () => FootprinterParamsBuilder<"w" | "p" | "pl" | "pw" | "h">
  sot343: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod323w: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  smc: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pw" | "pl">
  minimelf: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pw" | "pl">
  melf: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pw" | "pl">
  jst: () => FootprinterParamsBuilder<
    "w" | "h" | "p" | "id" | "pw" | "pl" | "ph" | "sh"
  >
  micromelf: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pw" | "pl">
  ms013: () => FootprinterParamsBuilder<"w" | "p">
  ms012: () => FootprinterParamsBuilder<"w" | "p">
  lqfp: (num_pins?: number) => FootprinterParamsBuilder<"w" | "h" | "pl" | "pw">
  sma: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  smf: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  smb: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  smbf: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  potentiometer: () => FootprinterParamsBuilder<
    "w" | "h" | "p" | "id" | "od" | "pw" | "ca"
  >
  electrolytic: () => FootprinterParamsBuilder<"d" | "p" | "id" | "od">
  sod923: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod323: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod80: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod882: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod882d: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod723: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod523: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod323f: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod323fl: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod128: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod123f: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod123fl: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod123: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod123w: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sod110: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  to92: () => FootprinterParamsBuilder<"w" | "h" | "p" | "id" | "od" | "inline">
  to92s: () => FootprinterParamsBuilder<"w" | "h" | "p" | "id" | "od">
  to92l: () => FootprinterParamsBuilder<"w" | "h" | "p" | "id" | "od">
  sot223: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  m2host: () => FootprinterParamsBuilder<never>
  son: (
    num_pins?: number,
  ) => FootprinterParamsBuilder<
    "w" | "h" | "p" | "pl" | "pw" | "epw" | "eph" | "ep"
  >
  vssop: (
    num_pins?: number,
  ) => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  msop: (
    num_pins?: number,
  ) => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
  sot23w: () => FootprinterParamsBuilder<"w" | "h" | "p" | "pl" | "pw">
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
    | "silkscreenlabels"
    | "silkscreenlabelmargin"
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
  smtpad: () => FootprinterParamsBuilder<
    | "circle"
    | "rect"
    | "square"
    | "pill"
    | "d"
    | "pd"
    | "diameter"
    | "r"
    | "pr"
    | "radius"
    | "w"
    | "pw"
    | "width"
    | "h"
    | "ph"
    | "height"
    | "s"
    | "size"
  > & {
    params: () => any
    soup: () => AnySoupElement[]
    circuitJson: () => AnyCircuitElement[]
  }
  platedhole: () => FootprinterParamsBuilder<
    "d" | "hd" | "r" | "hr" | "pd" | "pr"
  >
  pad: () => FootprinterParamsBuilder<"w" | "h"> & {
    params: () => any
    soup: () => AnySoupElement[]
    circuitJson: () => AnyCircuitElement[]
  }
  solderjumper: (
    num_pins?: number,
  ) => FootprinterParamsBuilder<"bridged" | "p" | "pw" | "ph">

  params: () => any
  /** @deprecated use circuitJson() instead */
  soup: () => AnySoupElement[]
  circuitJson: () => AnyCircuitElement[]
  json: () => AnyFootprinterDefinitionOutput[]
  getFootprintNames: () => string[]
}

export const string = (def: string): Footprinter => {
  let fp = footprinter()

  // The regex below automatically inserts a "res" prefix so forms like
  // "0603_pw1.0_ph1.1" are understood without typing "res0603".
  const modifiedDef = def.replace(/^((?:\d{4}|\d{5}))(?=$|_|x)/, "res$1")

  const def_parts = modifiedDef
    .split(/_(?!metric)/) // split on '_' not followed by 'metric'
    .map((s) => {
      const m = s.match(/([a-zA-Z]+)([\(\d\.\+\?].*)?/)
      if (!m) return null
      const [, rawFn, v] = m
      if (!rawFn) return null
      const fn = rawFn.toLowerCase()
      if (v?.includes("?")) return null
      return { fn, v }
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
        if (prop === "soup" || prop === "circuitJson") {
          if ("fn" in target && FOOTPRINT_FN[target.fn]) {
            return () => {
              const { circuitJson } = FOOTPRINT_FN[target.fn](target)
              const circuitWithoutSilkscreen = applyNoSilkscreen(
                circuitJson,
                target,
              )
              const circuitWithoutRefDes = applyNoRefDes(
                circuitWithoutSilkscreen,
                target,
              )
              return applyOrigin(circuitWithoutRefDes, target.origin)
            }
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
                  if (typeof v === "string" && v.includes("_metric")) {
                    target.metric = v.split("_metric")[0]
                  } else {
                    target.imperial = v // e.g., res0402, cap0603 etc.
                  }
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
