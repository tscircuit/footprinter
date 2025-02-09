import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import React, { useState, useCallback } from "react"
import ReactDOM from "react-dom/client"
import { fp } from "src/footprinter"
// @ts-ignore data is build during ci
import data from "./data"

interface Footprint {
  svgContent: string
  title: string
}

const FootprintCreator: React.FC = () => {
  const [definition, setDefinition] = useState("")
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Generate the SVG based on the provided footprint definition.
  const generateFootprint = useCallback(async (input: string) => {
    setError("")
    setGeneratedSvg(null)

    if (!input.trim()) {
      setError("Please enter a footprint definition.")
      return
    }

    setLoading(true)
    try {
      const circuitJson = fp.string(input).circuitJson()
      const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
      setGeneratedSvg(svgContent)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Form submission triggers generation.
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    generateFootprint(definition)
  }

  // When a grid item is clicked, update the definition and generate its SVG.
  const handleFootprintClick = (footprint: Footprint) => {
    setDefinition(footprint.title)
    generateFootprint(footprint.title)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Allow generation on pressing Enter (without Shift).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      generateFootprint(definition)
    }
  }

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>
          <a
            href="https://github.com/tscircuit/footprinter"
            style={styles.headerLink}
          >
            @tscircuit/footprinter
          </a>
        </h1>
        <div style={styles.githubStars}>
          <a
            href="https://github.com/tscircuit/footprinter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="GitHub stars"
              src="https://img.shields.io/github/stars/tscircuit/footprinter?style=social"
              style={styles.githubImage}
            />
          </a>
        </div>
      </header>

      <main style={styles.container}>
        {/* Generation Form */}
        <section style={styles.formSection}>
          <form onSubmit={handleGenerate} style={styles.form}>
            <textarea
              spellcheck={false}
              placeholder="Enter footprint definition (e.g., breakoutheaders_left15_right15_w8mm_p1.54mm)"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.textarea}
            />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Generating..." : "Generate Footprint"}
            </button>
          </form>
          {error && <p style={styles.error}>{error}</p>}
        </section>

        {/* Generated SVG Preview */}
        {generatedSvg && (
          <section style={styles.previewSection}>
            <h2 style={styles.previewTitle}>Generated Footprint</h2>
            <div dangerouslySetInnerHTML={{ __html: generatedSvg }} />
          </section>
        )}

        {/* Existing Footprints Grid */}
        <section style={styles.gallerySection}>
          <h2 style={styles.galleryTitle}>Existing Footprints</h2>
          <div style={styles.galleryItems}>
            {data.map((footprint, index) => (
              <div
                key={index}
                style={{
                  ...styles.svgContainer,
                  cursor: "pointer",
                }}
                onClick={() => handleFootprintClick(footprint)}
              >
                <div
                  style={styles.svgImage}
                  dangerouslySetInnerHTML={{
                    __html: footprint.svgContent,
                  }}
                />
                <div style={styles.svgTitle}>{footprint.title}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  body: {
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: 0,
    minHeight: "100vh",
  },
  header: {
    margin: "12px 64px",
    display: "flex",
    alignItems: "center",
  },
  headerTitle: {
    margin: 0,
    fontSize: "24px",
  },
  headerLink: {
    textDecoration: "none",
    color: "#007bff",
  },
  githubStars: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
  },
  githubImage: {
    height: "24px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  formSection: {
    textAlign: "center",
    marginBottom: "40px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  textarea: {
    width: "100%",
    maxWidth: "600px",
    padding: "15px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    resize: "vertical",
    minHeight: "100px",
  },
  button: {
    padding: "12px 25px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    color: "#dc3545",
    marginTop: "10px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  previewSection: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    marginBottom: "40px",
    display: "grid",
    placeItems: "center",
  },
  previewTitle: {
    margin: "0 0 20px 0",
    fontSize: "20px",
    textAlign: "center",
  },
  svgContainer: {
    position: "relative",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    width: "300px",
    height: "225px",
    margin: "1rem",
  },
  svgImage: {
    width: "100%",
    height: "100%",
  },
  svgTitle: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: "5px",
    fontSize: "12px",
    wordBreak: "break-all",
  },
  gallerySection: {
    marginTop: "40px",
  },
  galleryTitle: {
    textAlign: "center",
    fontSize: "24px",
    marginBottom: "20px",
  },
  galleryItems: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
}

const root = ReactDOM.createRoot(document.body!)
root.render(<FootprintCreator />)
