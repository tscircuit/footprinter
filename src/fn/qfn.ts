import type { AnyCircuitElement, PcbSmtPad } from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { addThermalVias, thermalViaDef } from "src/helpers/create-thermal-vias"
import { createThermalPad } from "../helpers/create-thermal-pad"
import { circlepad } from "../helpers/circlepad"
import { rectpad } from "../helpers/rectpad"
import { pillpad } from "../helpers/pillpad"
import { getGridRowLabel } from "../helpers/grid-row-label"
import { dim2d } from "../helpers/zod/dim-2d"
import { function_call } from "../helpers/zod/function-call"
import { base_quad_def, quad, quadTransform } from "./quad"

const positiveLength = length.refine(
  (value) => Number.isFinite(value) && value > 0,
  "QFN dimensions must be positive finite lengths",
)
const parsedDimensions = z.object({ x: z.number(), y: z.number() })

export const qfn_def = base_quad_def
  .extend(thermalViaDef.shape)
  .extend({
    fn: z.literal("qfn"),
    rows: z.coerce
      .number()
      .pipe(z.union([z.literal(1), z.literal(2)]))
      .default(1),
    grid: dim2d
      .or(parsedDimensions)
      .refine(
        ({ x, y }) =>
          Number.isInteger(x) && Number.isInteger(y) && x > 0 && y > 0,
        "QFN grid must contain positive integer side counts",
      )
      .optional()
      .describe("outer row sites: top/bottom by left/right"),
    thermalpad: z.union([z.literal(true), dim2d, parsedDimensions]).optional(),
    thermalvias: z
      .union([z.literal(true), dim2d, parsedDimensions])
      .refine(
        (value) =>
          value === true ||
          value === undefined ||
          (Number.isInteger(value.x) &&
            Number.isInteger(value.y) &&
            value.x > 0 &&
            value.y > 0),
        "thermal via grid dimensions must be positive integers",
      )
      .optional(),
    rowgap: positiveLength
      .optional()
      .describe("center gap between outer and inner rows"),
    rowspan: positiveLength
      .optional()
      .describe("opposing outer-row center span, on both axes"),
    staggered: z
      .boolean()
      .default(false)
      .describe("shift the inner rows left and down by half their pitch"),
    circularpads: z
      .boolean()
      .default(false)
      .describe("circular lands with diameter pw"),
    pinnumbering: z
      .preprocess(
        (value) =>
          typeof value === "string"
            ? value.replace(/^\(([^()]*)\)$/, "$1")
            : value,
        z.literal("ballcoords"),
      )
      .optional(),
    missing: function_call
      .default([])
      .describe("omit nominal pin numbers or package-coordinate sites"),
  })
  .transform((parameters) => {
    const rowPadSize =
      Math.min(
        parameters.px ?? parameters.p,
        parameters.py ?? parameters.p,
        parameters.rowgap ?? parameters.p,
      ) / 2
    const pw = parameters.pw ?? (parameters.rows === 2 ? rowPadSize : 0.25)
    const pl =
      parameters.pl ??
      (parameters.circularpads
        ? pw
        : parameters.rows === 2
          ? rowPadSize
          : 0.875)
    if (parameters.circularpads && (parameters.pillpads || pl !== pw))
      throw new Error("Circular QFN pads require equal pl/pw and no pillpads")
    if (parameters.circularpads) {
      if (
        parameters.leftrightpadwidth !== undefined ||
        parameters.leftrightpadlength !== undefined ||
        parameters.lrpw !== undefined ||
        parameters.lrpl !== undefined
      )
        throw new Error(
          "Circular QFN pads use one diameter and no left/right pad overrides",
        )
      for (const value of [
        parameters.p,
        parameters.px,
        parameters.py,
        pw,
        pl,
        parameters.w,
        parameters.h,
      ])
        if (value !== undefined && (!Number.isFinite(value) || value <= 0))
          throw new Error("QFN dimensions must be positive finite lengths")
    }
    if (parameters.rows === 1) {
      if (
        parameters.staggered ||
        parameters.rowgap !== undefined ||
        parameters.rowspan !== undefined
      )
        throw new Error("QFN rowgap, rowspan, and staggered require rows2")
      const gridCounts = parameters.grid
        ? {
            leftpins: parameters.grid.y,
            rightpins: parameters.grid.y,
            toppins: parameters.grid.x,
            bottompins: parameters.grid.x,
          }
        : {}
      for (const key of [
        "leftpins",
        "rightpins",
        "toppins",
        "bottompins",
      ] as const)
        if (
          parameters[key] !== undefined &&
          gridCounts[key] !== undefined &&
          parameters[key] !== gridCounts[key]
        )
          throw new Error("QFN grid conflicts with explicit side counts")
      return quadTransform({ ...parameters, ...gridCounts, pl, pw })
    }
    if (
      parameters.cc === false ||
      parameters.ccw === false ||
      parameters.startingpin ||
      parameters.leftrightpadwidth !== undefined ||
      parameters.leftrightpadlength !== undefined ||
      parameters.lrpw !== undefined ||
      parameters.lrpl !== undefined
    )
      throw new Error(
        "Two-row QFN uses counterclockwise grid numbering and uniform pad sizes",
      )
    for (const key of [
      "leftpins",
      "rightpins",
      "toppins",
      "bottompins",
      "lrpins",
      "leftrightpins",
      "tbpins",
      "topbottompins",
    ] as const)
      if (parameters[key] !== undefined)
        throw new Error("Two-row QFN uses grid instead of explicit side counts")
    const defaultCount = (parameters.num_pins + 8) / 8
    const grid = parameters.grid ?? { x: defaultCount, y: defaultCount }
    if (
      !Number.isInteger(grid.x) ||
      !Number.isInteger(grid.y) ||
      grid.x < 3 ||
      grid.y < 3 ||
      4 * (grid.x + grid.y) - 8 !== parameters.num_pins
    )
      throw new Error("Two-row QFN grid requires 4*(x+y)-8 nominal sites")
    const w =
      parameters.w ??
      parameters.h ??
      (grid.x + 2) * (parameters.px ?? parameters.p)
    const h =
      parameters.h ??
      parameters.w ??
      (grid.y + 2) * (parameters.py ?? parameters.p)
    for (const value of [
      parameters.p,
      parameters.px ?? parameters.p,
      parameters.py ?? parameters.p,
      pw,
      pl,
      w,
      h,
    ])
      if (!Number.isFinite(value) || value <= 0)
        throw new Error("QFN dimensions must be positive finite lengths")
    return {
      ...parameters,
      grid,
      w,
      h,
      pl,
      pw,
      rowgap: parameters.rowgap ?? parameters.p,
    }
  })

export type QfnInput = z.input<typeof qfn_def>
type QfnParameters = z.output<typeof qfn_def>
type Site = {
  x: number
  y: number
  label: string
  vertical: boolean
  number: number
}

const twoRowSites = (parameters: QfnParameters): Site[] => {
  const grid = parameters.grid!
  const sites: Site[] = []
  const spanX = parameters.rowspan ?? parameters.w - parameters.pl - 0.2
  const spanY = parameters.rowspan ?? parameters.h - parameters.pl - 0.2
  for (const row of [0, 1]) {
    const nx = grid.x - 2 * row
    const ny = grid.y - 2 * row
    const halfX = spanX / 2 - row * parameters.rowgap!
    const halfY = spanY / 2 - row * parameters.rowgap!
    if (halfX <= 0 || halfY <= 0)
      throw new Error("QFN rowgap leaves no inner-row span")
    const horizontalPitch = parameters.px ?? parameters.p
    const verticalPitch = parameters.py ?? parameters.p
    const offsetX = row && parameters.staggered ? -horizontalPitch / 2 : 0
    const offsetY = row && parameters.staggered ? -verticalPitch / 2 : 0
    // Corner-facing sites share the adjacent side's logical inner row/column;
    // interior staggered sites occupy alternating package grid coordinates.
    const column = (index: number) =>
      row
        ? 4 + 2 * index - (parameters.staggered ? 1 : 0)
        : index === grid.x - 1
          ? 2 * grid.x - 1
          : 2 + 2 * index
    const rowIndex = (index: number) =>
      row
        ? 2 + 2 * index + (parameters.staggered ? 1 : 0)
        : index === 0
          ? 1
          : 2 * index
    const add = (
      x: number,
      y: number,
      r: number,
      c: number,
      vertical: boolean,
    ) => {
      sites.push({
        x,
        y,
        label: `${getGridRowLabel(r)}${c}`,
        vertical,
        number: sites.length + 1,
      })
    }
    for (let index = 0; index < ny; index++)
      add(
        -halfX,
        ((ny - 1) / 2 - index) * verticalPitch + offsetY,
        rowIndex(index),
        row + 1,
        true,
      )
    for (let index = 0; index < nx; index++)
      add(
        (index - (nx - 1) / 2) * horizontalPitch + offsetX,
        -halfY,
        2 * grid.y - 1 - row,
        column(index),
        false,
      )
    for (let index = ny - 1; index >= 0; index--)
      add(
        halfX,
        ((ny - 1) / 2 - index) * verticalPitch + offsetY,
        rowIndex(index),
        2 * grid.x - row,
        true,
      )
    for (let index = nx - 1; index >= 0; index--)
      add(
        (index - (nx - 1) / 2) * horizontalPitch + offsetX,
        halfY,
        row,
        column(index),
        false,
      )
  }
  return sites
}

const selectSites = (sites: Site[], parameters: QfnParameters) => {
  const omitted = new Set<number>()
  for (const requested of parameters.missing) {
    const site =
      typeof requested === "number"
        ? sites.find((site) => site.number === requested)
        : sites.find((site) => site.label === requested)
    if (!site)
      throw new Error(
        `QFN missing site ${requested} is outside the nominal package`,
      )
    if (omitted.has(site.number))
      throw new Error("QFN missing sites must not contain duplicates")
    omitted.add(site.number)
  }
  return sites.filter((site) => !omitted.has(site.number))
}

const getHints = (
  site: Site,
  parameters: QfnParameters,
): Array<string | number> => {
  if (parameters.pinnumbering === "ballcoords") return [site.label]
  return [site.number]
}

const validateTwoRowCopper = (pads: PcbSmtPad[], parameters: QfnParameters) => {
  const lands = pads.map((pad) => {
    if (pad.shape !== "circle" && pad.shape !== "rect" && pad.shape !== "pill")
      throw new Error("Unsupported QFN pad shape")
    return {
      pad,
      x: pad.x,
      y: pad.y,
      rx: pad.shape === "circle" ? pad.radius : pad.width / 2,
      ry: pad.shape === "circle" ? pad.radius : pad.height / 2,
    }
  })
  for (const [index, land] of lands.entries()) {
    if (
      land.rx <= 0 ||
      land.ry <= 0 ||
      Math.abs(land.x) + land.rx > parameters.w / 2 + 1e-10 ||
      Math.abs(land.y) + land.ry > parameters.h / 2 + 1e-10
    )
      throw new Error("QFN copper must fit inside the package body")
    for (const other of lands.slice(index + 1)) {
      const dx = Math.abs(land.x - other.x)
      const dy = Math.abs(land.y - other.y)
      let intersects: boolean
      if (land.pad.shape === "circle" && other.pad.shape === "circle")
        intersects = Math.hypot(dx, dy) <= land.rx + other.rx + 1e-10
      else if (land.pad.shape === "circle" || other.pad.shape === "circle") {
        const circle = land.pad.shape === "circle" ? land : other
        const rectangle = land.pad.shape === "circle" ? other : land
        intersects =
          Math.hypot(
            Math.max(dx - rectangle.rx, 0),
            Math.max(dy - rectangle.ry, 0),
          ) <=
          circle.rx + 1e-10
      } else
        intersects =
          dx <= land.rx + other.rx + 1e-10 && dy <= land.ry + other.ry + 1e-10
      if (intersects)
        throw new Error(
          `QFN copper for ${land.pad.port_hints?.[0]} and ${other.pad.port_hints?.[0]} overlaps`,
        )
    }
  }
}

export const qfn = (
  rawParameters: QfnInput,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = qfn_def.parse({ ...rawParameters, legsoutside: false })
  let circuitJson: AnyCircuitElement[]
  if (parameters.rows === 1) {
    const thermalpad =
      typeof parameters.thermalpad === "object"
        ? `${parameters.thermalpad.x}x${parameters.thermalpad.y}mm`
        : parameters.thermalpad
    const quadResult = quad({ ...rawParameters, ...parameters, thermalpad })
    const perimeter = quadResult.circuitJson.filter(
      (element): element is Extract<PcbSmtPad, { shape: "rect" | "pill" }> =>
        element.type === "pcb_smtpad" &&
        (element.shape === "rect" || element.shape === "pill") &&
        !element.port_hints?.includes("thermalpad"),
    )
    if (
      parameters.pinnumbering ||
      parameters.missing.some((site) => typeof site === "string")
    )
      throw new Error("QFN package-coordinate numbering requires rows2")
    const sites = perimeter.map((pad) => ({
      number: Number(pad.port_hints?.[0]),
      label: pad.port_hints![0]!,
      x: pad.x,
      y: pad.y,
      vertical: false,
    }))
    const selected = selectSites(sites, parameters)
    const selectedNumbers = new Set(selected.map((site) => site.number))
    circuitJson = quadResult.circuitJson.filter(
      (element) =>
        element.type !== "pcb_smtpad" ||
        element.port_hints?.includes("thermalpad") ||
        selectedNumbers.has(Number(element.port_hints?.[0])),
    )
    if (parameters.circularpads)
      circuitJson = circuitJson.map((element) =>
        element.type === "pcb_smtpad" &&
        element.shape === "rect" &&
        !element.port_hints?.includes("thermalpad")
          ? circlepad(element.port_hints ?? [], {
              x: element.x,
              y: element.y,
              radius: parameters.pw / 2,
            })
          : element,
      )
  } else {
    const sites = selectSites(twoRowSites(parameters), parameters)
    const pads = sites.map((site) => {
      const hints = getHints(site, parameters)
      if (parameters.circularpads)
        return circlepad(hints, {
          x: site.x,
          y: site.y,
          radius: parameters.pw / 2,
        })
      return (parameters.pillpads ? pillpad : rectpad)(
        hints,
        site.x,
        site.y,
        site.vertical ? parameters.pl : parameters.pw,
        site.vertical ? parameters.pw : parameters.pl,
      )
    })
    if (parameters.thermalpad) {
      const dimensions =
        parameters.thermalpad === true
          ? {
              x:
                (parameters.rowspan ?? parameters.w - parameters.pl - 0.2) -
                2 * parameters.rowgap! -
                2 * parameters.pl,
              y:
                (parameters.rowspan ?? parameters.h - parameters.pl - 0.2) -
                2 * parameters.rowgap! -
                2 * parameters.pl,
            }
          : parameters.thermalpad
      const exposed = createThermalPad(dimensions, {
        x: parameters.thermalpadcenteroffsetx,
        y: parameters.thermalpadcenteroffsety,
      })
      if (parameters.pinnumbering === "ballcoords")
        exposed.port_hints = ["EP", "thermalpad"]
      pads.push(exposed)
    }
    validateTwoRowCopper(pads, parameters)
    const outerCounts = {
      leftpins: parameters.grid!.y,
      rightpins: parameters.grid!.y,
      toppins: parameters.grid!.x,
      bottompins: parameters.grid!.x,
    }
    const decoration = quad({
      fn: "qfn",
      num_pins: 2 * (parameters.grid!.x + parameters.grid!.y),
      ...outerCounts,
      w: parameters.w,
      h: parameters.h,
      p: parameters.p,
      px: parameters.px,
      py: parameters.py,
      pw: parameters.pw,
      pl: parameters.pl,
    }).circuitJson.filter((element) => element.type !== "pcb_smtpad")
    circuitJson = [...pads, ...decoration]
  }
  return { circuitJson: addThermalVias(circuitJson, parameters), parameters }
}
