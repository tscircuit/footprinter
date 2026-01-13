/**
 * PDIP (Plastic Dual In-line Package) footprint
 *
 * PDIP is the standard plastic version of DIP packages.
 * Common variants: PDIP-8, PDIP-14, PDIP-16, PDIP-20, PDIP-28, etc.
 *
 * Standard specifications:
 * - Pin pitch: 2.54mm (100 mil)
 * - Row spacing: 7.62mm (300 mil) for narrow, 15.24mm (600 mil) for wide
 */

import { dip, dip_def, extendDipDef, getCcwDipCoords } from "./dip"

// PDIP uses the same implementation as DIP
export const pdip = dip

// Export the definition for type compatibility
export const pdip_def = dip_def
export const extendPdipDef = extendDipDef
export const getCcwPdipCoords = getCcwDipCoords
