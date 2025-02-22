import fs from "fs";
import path from "path";
const snapshotsDir = path.join(__dirname, "..", "tests", "__snapshots__");
const outputDir = path.join(__dirname, "..", "public");
const outputFile = path.join(outputDir, "gallery.html");
function generateGalleryPage() {
    const svgFiles = fs
        .readdirSync(snapshotsDir)
        .filter((file) => file.endsWith(".snap.svg"));
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>tscircuit/footprinter gallery</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }
        h1 a {
          text-decoration: none;
          color: #007bff;
          font-size: 24px;
        }
        .header {
            margin: 12px;
            margin-left: 64px;
            margin-right: 64px;
            display: flex;
        }
        .gallery-items {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }
        .svg-container {
            margin: 10px;
            position: relative;
            width: 300px;
            height: 225px;
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
        .github-stars {
          margin-left: auto;
          display: flex;
          align-items: center;
        }

        .github-stars a img {
          height: 24px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1><a href="https://github.com/tscircuit/footprinter">@tscircuit/footprinter</a></h1>
        <div style="flex-grow: 1"></div>
        <div class="github-stars">
          <a href="https://github.com/tscircuit/footprinter" target="_blank">
            <img alt="GitHub stars" src="https://img.shields.io/github/stars/tscircuit/footprinter?style=social">
          </a>
        </div>
    </div>
    <div class="gallery-items">
    ${svgFiles
        .map((file) => {
        const svgContent = fs
            .readFileSync(path.join(snapshotsDir, file), "utf-8")
            .replace(/width="\d+"/, 'width="300"')
            .replace(/height="\d+"/, 'height="225" viewBox="0 0 800 600"');
        const title = file.replace(".snap.svg", "");
        return `
    <div class="svg-container">
        ${svgContent}
        <div class="svg-title">${title}</div>
    </div>`;
    })
        .join("\n")}
    </div>
</body>
</html>
  `;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputFile, htmlContent);
    console.log(`Gallery page generated at ${outputFile}`);
}
generateGalleryPage();
