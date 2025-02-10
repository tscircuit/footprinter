import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import React, { useState, useCallback } from "react"
import ReactDOM from "react-dom/client"
import { fp } from "src/footprinter"
// @ts-ignore data is built during CI
import data from "./content"

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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex items-center">
          <h1 className="text-2xl font-bold">
            <a
              href="https://github.com/tscircuit/footprinter"
              className="hover:underline"
            >
              @tscircuit/footprinter
            </a>
          </h1>
          <div className="ml-auto">
            <a
              href="https://github.com/tscircuit/footprinter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="GitHub stars"
                src="https://img.shields.io/github/stars/tscircuit/footprinter?style=social"
                className="h-6"
              />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white relative rounded-lg shadow-lg p-6">
          {/* Responsive Left/Right Layout */}
          <div className="grid place-items-center w-full grid-cols-1 md:grid-cols-5 gap-4 gap-6">
            {/* Left: Form */}
            <section className="w-full h-full grid place-items-center col-span-2">
              <form onSubmit={handleGenerate} className="flex flex-col w-full">
                <textarea
                  spellCheck={false}
                  placeholder="Enter footprint definition (e.g., breakoutheaders_left15_right15_w8mm_p1.54mm)"
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y min-h-[150px] text-lg font-medium"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4  bottom-4 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {loading ? "Generating..." : "Generate Footprint"}
                </button>
              </form>
              {error && (
                <p className="mt-3 text-red-500 font-bold text-center">
                  {error}
                </p>
              )}
            </section>

            {/* Right: SVG Preview */}
            <section className="w-full h-full rounded-md col-span-3 grid place-items-center shadow p-4">
              {generatedSvg ? (
                <>
                  <img
                    src={`data:image/svg+xml;base64,${btoa(generatedSvg)}`}
                    alt="Generated Footprint"
                    className="w-full h-full object-contain"
                  />
                </>
              ) : (
                <p className="text-gray-500">
                  Preview will appear here once generated.
                </p>
              )}
            </section>
          </div>
        </div>

        {/* Gallery Section */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-center mb-6">
            Existing Footprints
          </h2>
          <div className="grid grid-cols-1  md:grid-cols-3 gap-6">
            {data.map((footprint, index) => (
              <div
                key={index}
                className="relative grid place-items-center"
                onClick={() => handleFootprintClick(footprint)}
              >
                <img
                  src={`data:image/svg+xml;base64,${btoa(
                    footprint.svgContent,
                  )}`}
                  alt={`${footprint.title} Footprint SVG`}
                  className="rounded-md shadow cursor-pointer hover:shadow-lg transition-shadow w-full h-full object-contain"
                />
                <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 px-2 py-1 text-xs rounded !break-all">
                  {footprint.title}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

const root = ReactDOM.createRoot(document.body!)
root.render(<FootprintCreator />)
