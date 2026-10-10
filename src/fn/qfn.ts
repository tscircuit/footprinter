import type { AnySoupElement } from "circuit-json"
import { addThermalVias, thermalViaDef } from "src/helpers/create-thermal-vias"
import {
  QUAD_PAD_EDGE_INSET_MM,
  getQuadThermalPadDimensions,
} from "src/helpers/quad-pad-geometry"
import type { z } from "zod"
import { base_quad_def, quad, quadTransform, quad_def } from "./quad"

export const qfn_def = base_quad_def
  .extend(thermalViaDef.shape)
  .transform(quadTransform)

const QFN_THERMAL_PAD_CLEARANCE_MM = 0.1

export const qfn = (
  rawParameters: z.input<typeof qfn_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const qfnParameters = {
    ...rawParameters,
    legsoutside: false,
    pl: rawParameters.pl ?? 0.875,
    pw: rawParameters.pw ?? 0.25,
  }
  if (rawParameters.thermalpad === true && rawParameters.pl === undefined) {
    const parameters = quad_def.parse(qfnParameters)
    const thermalPadDimensions = getQuadThermalPadDimensions(parameters)
    // Reserve the body-edge inset and EP copper clearance on each side.
    const maxPadLength =
      Math.min(
        (parameters.w - thermalPadDimensions.x) / 2 -
          Math.abs(parameters.thermalpadcenteroffsetx),
        (parameters.h - thermalPadDimensions.y) / 2 -
          Math.abs(parameters.thermalpadcenteroffsety),
      ) -
      QUAD_PAD_EDGE_INSET_MM -
      QFN_THERMAL_PAD_CLEARANCE_MM
    if (maxPadLength <= 0) {
      throw new Error(
        "No room for automatic QFN pads with 0.1 mm thermal-pad clearance; check package dimensions and thermal pad offsets",
      )
    }
    qfnParameters.pl = Math.min(parameters.pl, maxPadLength)
  }
  const quadResult = quad(qfnParameters)
  const thermalViaParameters = thermalViaDef.parse(rawParameters)

  return {
    circuitJson: addThermalVias(quadResult.circuitJson, thermalViaParameters),
    parameters: { ...quadResult.parameters, ...thermalViaParameters },
  }
}
