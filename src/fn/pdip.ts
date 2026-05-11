import { dip } from "./dip"

/**
 * PDIP (Plastic Dual Inline Package) is an alias for DIP.
 * The "P" simply indicates the plastic package material.
 */
export const pdip = (raw_params: any) => {
  return dip(raw_params)
}
