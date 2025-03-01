import fs from "fs-extra";
import path from "path";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const DOCS_DIR = path.resolve("cache/docs"); 
const AI_MODEL = "mixtral-8x7b-32768";

fs.ensureDirSync(DOCS_DIR);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateDoc(footprintType: string): Promise<string> {
  const docFilePath = path.join(DOCS_DIR, `${footprintType}.md`);

  if (fs.existsSync(docFilePath)) {
    console.log(`✅ Using cached documentation from ${docFilePath}`);
    return fs.readFileSync(docFilePath, "utf-8");
  }

  console.log(`🔹 Generating documentation for ${footprintType}...`);

  const prompt = `
Generate documentation for the \`${footprintType}\` footprint in the following format:

## \`${footprintType}\`

### Syntax
\`<footprint_syntax>\`

### Examples
- \`<example_1>\`

### Defaults
- \`<default_1>\`

### Notes
- \`<note_1>\`

Ensure the output is short, structured, and useful for AI processing.
  `;

  try {
    const response = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: "You are a helpful documentation generator." },
        { role: "user", content: prompt },
      ],
    });

    console.log(`🛠️ Groq API Response:`, JSON.stringify(response, null, 2));

    if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
      console.error("❌ Groq API returned an empty response.");
      return "Error: No response from Groq API.";
    }

    const doc = response.choices[0].message.content.trim();
    console.log(`✅ Documentation generated for ${footprintType}:\n${doc}`);

    try {
      fs.writeFileSync(docFilePath, doc, "utf-8");
      console.log(`📄 Documentation saved at ${docFilePath}`);
    } catch (writeError) {
      console.error(`❌ Error saving markdown file:`, writeError);
    }

    return doc;
  } catch (error) {
    console.error(`❌ Error generating documentation for ${footprintType}:`, error);
    return `Error: ${error.message}`;
  }
}
