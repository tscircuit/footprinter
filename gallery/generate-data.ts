import path from "path"
import fs from "fs"

const snapshotsDir = path.join(__dirname, "..", "tests", "__snapshots__")
const outputFile = path.join(__dirname, "data.ts")

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function getSvgFiles(dir) {
  try {
    return fs.readdirSync(dir).filter((file) => file.endsWith(".snap.svg"))
  } catch (error) {
    console.warn(
      `Directory not found: ${dir}. Proceeding with empty file list.`,
    )
    return []
  }
}

function readAndFormatSvg(filePath) {
  try {
    const svgContent = fs
      .readFileSync(filePath, "utf-8")
      .replace(/width="\d+"/, 'width="300"')
      .replace(/height="\d+"/, 'height="225" viewBox="0 0 800 600"')
    return svgContent
  } catch (error) {
    console.warn(`Failed to read file: ${filePath}. Skipping.`)
    return null
  }
}

function generateFootprintsData(svgFiles) {
  return svgFiles.reduce((data, file) => {
    const filePath = path.join(snapshotsDir, file)
    const svgContent = readAndFormatSvg(filePath)

    if (svgContent) {
      data.push({
        svgContent,
        title: path.basename(file, ".snap.svg"),
      })
    }
    return data
  }, [])
}

// Ensure output directory exists
ensureDirectoryExists(path.dirname(outputFile))

// Process SVG files
const svgFiles = getSvgFiles(snapshotsDir)
const data = generateFootprintsData(svgFiles)

// Write to output file
try {
  fs.writeFileSync(
    outputFile,
    `export default ${JSON.stringify(data, null, 2)};`,
  )
  console.log(`Data successfully written to ${outputFile}`)
} catch (error) {
  console.error(`Failed to write to ${outputFile}:`, error)
}

// Build site
const buildOutput = await Bun.build({
  outdir: "public",
  entrypoints: ["./gallery/index.tsx"],
})
console.log("\n", buildOutput)
