import type { ExecutionContext } from "ava"
import { fp } from "../../src"
import { logSoup } from "@tscircuit/log-soup"
import type { AnySoupElement } from "@tscircuit/soup"

export const getTestFixture = async (t: ExecutionContext) => {
  return {
    fp,
    logSoup: (soup: AnySoupElement[]) => {
      if (process.env.CI) return
      return logSoup(`footprinter: ${t.title}`, soup)
    },
    logSoupWithPrefix: (prefix: string, soup: AnySoupElement[]) => {
      if (process.env.CI) return
      return logSoup(`footprinter: ${t.title} ${prefix}`, soup)
    },
  }
}
