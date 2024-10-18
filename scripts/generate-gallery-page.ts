import fs from "fs"
import path from "path"

const snapshotsDir = path.join(__dirname, "..", "tests", "__snapshots__")
const outputDir = path.join(__dirname, "..", "public")
const outputFile = path.join(outputDir, "gallery.html")

function generateGalleryPage() {
  const svgFiles = fs
    .readdirSync(snapshotsDir)
    .filter((file) => file.endsWith(".snap.svg"))

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG Gallery</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            background-color: #f0f0f0;
        }
        .svg-container {
            margin: 10px;
            position: relative;
            width: 300px;
            height: 300px;
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .svg-container svg {
            width: 100%;
            height: 100%;
        }
        .svg-title {
            position: absolute;
            bottom: 10px;
            left: 10px;
            background-color: rgba(255,255,255,0.7);
            padding: 5px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    ${svgFiles
      .map((file) => {
        const svgContent = fs.readFileSync(
          path.join(snapshotsDir, file),
          "utf-8",
        )
        const title = file.replace(".snap.svg", "")
        return `
    <div class="svg-container">
        ${svgContent}
        <div class="svg-title">${title}</div>
    </div>`
      })
      .join("\n")}
</body>
</html>
  `

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputFile, htmlContent)
  console.log(`Gallery page generated at ${outputFile}`)
}

generateGalleryPage()
