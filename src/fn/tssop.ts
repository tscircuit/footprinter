import type { AnyCircuitElement } from "circuit-json"
import { length } from "circuit-json"
import { extendSoicDef, soicWithoutParsing, type SoicInput } from "./soic"

export const tssop_def = extendSoicDef({
  w: "7.1mm",
  p: "0.65mm",
  pl: "1.35mm",
  pw: "0.40mm",
  legsoutside: true,
})

export const tssop = (
  raw_params: SoicInput,
): { circuitJson: AnyCircuitElement[]; parameters: SoicInput } => {
  const params: Record<string, unknown> = { ...raw_params }
  const pRaw = params.p
  const pValue =
    typeof pRaw === "string" || typeof pRaw === "number"
      ? length.parse(pRaw)
      : undefined

  if (pValue != null && pValue <= length.parse("0.5mm")) {
    if (params.pl == null) {
      params.pl = "1.45mm"
    }
    if (params.pw == null) {
      params.pw = "0.3mm"
    }
  }

  const parameters = tssop_def.parse(params)
  const circuitJson = soicWithoutParsing(parameters)

  if (pValue != null && pValue <= length.parse("0.5mm")) {
    const inset = length.parse("0.075mm")
    for (const element of circuitJson) {
      if (element.type === "pcb_smtpad" && "x" in element) {
        const x = element.x
        element.x = x + (x >= 0 ? -inset : inset)
      }
    }
  }

  return {
    circuitJson,
    parameters,
  }
}
