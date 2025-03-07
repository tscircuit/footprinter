export * from "./footprinter"
export * from "./helpers/generateDocs"
import { generateDoc } from "./helpers/generateDocs"

async function main() {
  const footprints = ["dip", "sop", "bga"]

  for (const footprint of footprints) {
    try {
      const doc = await generateDoc(footprint)
    } catch (error) {
      console.error(
        `❌ Failed to generate documentation for ${footprint}:`,
        error,
      )
    }
  }
}

main()
