import fs, { promises as fsPromises } from "fs"
import path from "path"
import * as fp from "../src/fn"
import { OpenAI } from "openai"
import { cache } from "./cache"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const footprintFileNames = Object.keys(fp)

async function generateDocumentation(
  filePath: string,
): Promise<string | undefined> {
  const fileContent = await fsPromises.readFile(filePath, "utf-8")
  const cacheKey = `doc:${filePath}`
  const cachedDoc: string | undefined = cache.get(cacheKey)

  if (cachedDoc) {
    return cachedDoc
  }

  let context = ""

  try {
    const data = await fsPromises.readFile(
      path.join(__dirname, "..", "repomix-output.txt"),
      "utf8",
    )
    context = data
  } catch (err) {
    console.error("Error reading file:", err)
  }

  const prompt = `Generate documentation for the following footprint code:

${fileContent}

Documentation should be concise and useful to AI, ONLY output an md file with headers. Look at test files for example usage and the implementation file for properties. Here are notes an a example:

## \`{name}\`

### Syntax

\`{name}\${pins}_w\${width}_h\${height}_p\${pitch}_Use all parameters in the function\`

\`or(if function extends passive):\`

\`{name}\${imperial}\`

### Examples

- \`{name}8_w2.54mm\`

### Defaults

- \`num_pins\`: \`8\` (default)
- \`w\`: \`2.56mm\` for less than 8 pins, \`1.24mm\` for more than 8 pins
- Use all parameters in the function

### Notes

<!-- Explanation for the different parameters -->

- \`p\`: pitch distance between centers of pins on left and right sides
- \`pl\`: pad length
- \`pw\`: pad width
- Use all parameters in the function.`

  const response = await openai.chat.completions.create({
    model: "o3-mini",
    messages: [
      { role: "system", content: context },
      { role: "user", content: prompt },
    ],
  })

  const documentation = response.choices[0]?.message.content?.trim()
  cache.set(cacheKey, documentation)
  return documentation
}

async function main() {
  for (const fileName of footprintFileNames) {
    if (fileName === "index") continue
    const filePath = `src/fn/${fileName}.ts`
    const doc = await generateDocumentation(filePath)
    const dirPath = "footprint-docs"

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    const docFilePath = path.join(
      dirPath,
      path.basename(filePath, ".ts") + ".md",
    )
    await fsPromises.writeFile(
      docFilePath,
      doc || "No documentation generated.",
    )
    console.log(`Documentation for ${filePath} generated at ${docFilePath}`)
  }
}

main().catch(console.error)
