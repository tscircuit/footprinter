import type { ExecutionContext } from "ava"
import { fp } from "../../src"
import { logSoup } from "@tscircuit/log-soup"
import type { AnySoupElement } from "@tscircuit/soup"
import { pcbSoupToSvg, soupToSvg } from "circuit-to-svg";

export const getTestFixture = async (t: ExecutionContext) => {
  return {
    fp,
    logSoup: (soup: AnySoupElement[]) => {
      if (process.env.CI) return
      if (process.env.FULL_RUN) return
      return logSoup(`footprinter: ${t.title}`, soup)
    },
    logSoupWithPrefix: (prefix: string, soup: AnySoupElement[]) => {
      if (process.env.CI) return
      if (process.env.FULL_RUN) return
      return logSoup(`footprinter: ${t.title} ${prefix}`, soup)
    },
    pcbToSvg: (soup: AnySoupElement[]) => {
      return pcbSoupToSvg(soup)
    },
    schematicToSvg: (soup: AnySoupElement[]) => {
      return soupToSvg(soup)
    },
  }
}
