export type PassiveFootprintFamily = "res" | "cap" | "diode" | "led"

export interface FootprinterStringOptions {
  /** Family to use for bare numeric sizes. Explicit footprint names take precedence. */
  defaultFamily?: PassiveFootprintFamily
}

/** Qualify bare passive sizes without changing their dimensions or modifiers. */
export const resolvePassiveFootprintDefinition = (
  definition: string,
  { defaultFamily = "res" }: FootprinterStringOptions = {},
): string =>
  definition.trim().replace(/^(\d{4,5})(?=$|_|x)/, `${defaultFamily}$1`)
