import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("pinrow requires both explicit courtyard dimensions", () => {
  for (const definition of ["pinrow3_cyw8.12mm", "pinrow3_cyh3.04mm"]) {
    expect(() => fp.string(definition).circuitJson()).toThrow(
      "'cyw' and 'cyh' must be provided together",
    )
  }
})
