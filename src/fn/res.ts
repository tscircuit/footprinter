import type { AnySoupElement } from "circuit-json"
import { passive, type PassiveDef } from "../helpers/passive-fn"
import { res0402Array2 } from "../helpers/res0402-array2"
import { res0402Array4 } from "../helpers/res0402-array4"
import { res0603Array2 } from "../helpers/res0603-array2"
import { res0603Array4 } from "../helpers/res0603-array4"
import { res0606Array2 } from "../helpers/res0606-array2"
import { res1206Array4 } from "../helpers/res1206-array4"

type ResArrayParams = PassiveDef & {
  array?: number | string
  x?: number | string
}

const getArrayCount = (parameters: ResArrayParams): number | undefined => {
  const arrayValue = parameters.array ?? parameters.x
  if (typeof arrayValue === "number") {
    return Number.isNaN(arrayValue) ? undefined : arrayValue
  }
  if (typeof arrayValue === "string") {
    const parsed = Number.parseInt(arrayValue, 10)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  if (typeof parameters.imperial === "string") {
    const match = parameters.imperial.match(/(?:array|x)(2|4)$/)
    const count = match?.[1]
    if (count) {
      return Number.parseInt(count, 10)
    }
  }

  return undefined
}

const getImperialBase = (imperial?: string | number): string | undefined => {
  if (!imperial) return undefined
  const imperialString = typeof imperial === "number" ? `${imperial}` : imperial
  return imperialString.split("_")[0]
}

export const res = (
  rawParameters: ResArrayParams,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const arrayCount = getArrayCount(rawParameters)
  const imperialBase = getImperialBase(rawParameters.imperial)

  if (arrayCount === 2 && imperialBase === "0402") {
    return {
      circuitJson: res0402Array2(rawParameters),
      parameters: rawParameters,
    }
  }

  if (arrayCount === 4 && imperialBase === "0402") {
    return {
      circuitJson: res0402Array4(rawParameters),
      parameters: rawParameters,
    }
  }

  if (arrayCount === 2 && imperialBase === "0603") {
    return {
      circuitJson: res0603Array2(rawParameters),
      parameters: rawParameters,
    }
  }

  if (arrayCount === 4 && imperialBase === "0603") {
    return {
      circuitJson: res0603Array4(rawParameters),
      parameters: rawParameters,
    }
  }

  if (arrayCount === 2 && imperialBase === "0606") {
    return {
      circuitJson: res0606Array2(rawParameters),
      parameters: rawParameters,
    }
  }

  if (arrayCount === 4 && imperialBase === "1206") {
    return {
      circuitJson: res1206Array4(rawParameters),
      parameters: rawParameters,
    }
  }

  return { circuitJson: passive(rawParameters), parameters: rawParameters }
}
