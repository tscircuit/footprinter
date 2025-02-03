import { logSoup } from "@tscircuit/log-soup"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import fs from "node:fs"
import path from "node:path"
import { fp } from "../../src/footprinter"

export const getTestFixture = async (testName: string) => {
  const outputDir = path.join(__dirname, "../__snapshots__")
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const snapshotSoup = (soup: AnyCircuitElement[]) => {
    const outputPath = path.join(outputDir, `${testName}.svg`)
    const svg = convertCircuitJsonToPcbSvg(soup)
    fs.writeFileSync(outputPath, svg)
  }

  return {
    fp,
    logSoup: (soup: AnyCircuitElement[]) => {
      if (process.env.CI || process.env.FULL_RUN) return
      return logSoup(`footprinter: ${testName}`, soup)
    },
    logSoupWithPrefix: (prefix: string, soup: AnyCircuitElement[]) => {
      if (process.env.CI || process.env.FULL_RUN) return
      return logSoup(`footprinter: ${testName} ${prefix}`, soup)
    },
    snapshotSoup,
  }
}
