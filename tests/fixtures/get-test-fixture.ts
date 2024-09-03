import { logSoup } from "@tscircuit/log-soup"
import type { AnySoupElement } from "@tscircuit/soup"
import type { ExecutionContext } from "ava"
import { circuitJsonToPcbSvg } from "circuit-to-svg"
import fs from "fs"
import path from "path"
import { fp } from "../../src"

export const getTestFixture = async (t: ExecutionContext) => {
  const outputDir = path.join(__dirname, "../output")
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const snapshotSoup = (soup: AnySoupElement[]) => {
    const outputPath = path.join(outputDir, `${t.title}.svg`)
    const svg = circuitJsonToPcbSvg(soup)
    fs.writeFileSync(outputPath, svg)
  }

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
    snapshotSoup,
  }
}
