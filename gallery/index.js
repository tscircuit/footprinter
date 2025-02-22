import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { fp } from "src/footprinter";
// @ts-ignore data is built during CI
import data from "./content";
const FootprintCreator = () => {
    const [definition, setDefinition] = useState("");
    const [generatedSvg, setGeneratedSvg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    // Generate the SVG based on the provided footprint definition.
    const generateFootprint = useCallback(async (input) => {
        setError("");
        setGeneratedSvg(null);
        if (!input.trim()) {
            setError("Please enter a footprint definition.");
            return;
        }
        setLoading(true);
        try {
            const circuitJson = fp.string(input).circuitJson();
            const svgContent = convertCircuitJsonToPcbSvg(circuitJson);
            setGeneratedSvg(svgContent);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Form submission triggers generation.
    const handleGenerate = (e) => {
        e.preventDefault();
        generateFootprint(definition);
    };
    // When a grid item is clicked, update the definition and generate its SVG.
    const handleFootprintClick = (footprint) => {
        setDefinition(footprint.title);
        generateFootprint(footprint.title);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    // Allow generation on pressing Enter (without Shift).
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            generateFootprint(definition);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-100 to-purple-100", children: [_jsx("header", { className: "bg-blue-600 text-white py-4 shadow-md", children: _jsxs("div", { className: "container mx-auto px-4 flex items-center", children: [_jsx("h1", { className: "text-2xl font-bold", children: _jsx("a", { href: "https://github.com/tscircuit/footprinter", className: "hover:underline", children: "@tscircuit/footprinter" }) }), _jsx("div", { className: "ml-auto", children: _jsx("a", { href: "https://github.com/tscircuit/footprinter", target: "_blank", rel: "noopener noreferrer", children: _jsx("img", { alt: "GitHub stars", src: "https://img.shields.io/github/stars/tscircuit/footprinter?style=social", className: "h-6" }) }) })] }) }), _jsxs("main", { className: "container mx-auto px-4 py-6", children: [_jsx("div", { className: "bg-white relative rounded-lg shadow-lg p-6", children: _jsxs("div", { className: "grid place-items-center w-full grid-cols-1 md:grid-cols-5 gap-4 gap-6", children: [_jsxs("section", { className: "w-full h-full grid place-items-center col-span-2", children: [_jsxs("form", { onSubmit: handleGenerate, className: "flex flex-col w-full", children: [_jsx("textarea", { spellCheck: false, placeholder: "Enter footprint definition (e.g., breakoutheaders_left15_right15_w8mm_p1.54mm)", value: definition, onChange: (e) => setDefinition(e.target.value), onKeyDown: handleKeyDown, className: "w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y min-h-[150px] text-lg font-medium" }), _jsx("button", { type: "submit", disabled: loading, className: "mt-4  bottom-4 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer", children: loading ? "Generating..." : "Generate Footprint" })] }), error && (_jsx("p", { className: "mt-3 text-red-500 font-bold text-center", children: error }))] }), _jsx("section", { className: "w-full h-full rounded-md col-span-3 grid place-items-center shadow p-4", children: generatedSvg ? (_jsx(_Fragment, { children: _jsx("img", { src: `data:image/svg+xml;base64,${btoa(generatedSvg)}`, alt: "Generated Footprint", className: "w-full h-full object-contain" }) })) : (_jsx("p", { className: "text-gray-500", children: "Preview will appear here once generated." })) })] }) }), _jsxs("section", { className: "mt-10", children: [_jsx("h2", { className: "text-2xl font-bold text-center mb-6", children: "Existing Footprints" }), _jsx("div", { className: "grid grid-cols-1  md:grid-cols-3 gap-6", children: data.map((footprint, index) => (_jsxs("div", { className: "relative grid place-items-center", onClick: () => handleFootprintClick(footprint), children: [_jsx("img", { src: `data:image/svg+xml;base64,${btoa(footprint.svgContent)}`, alt: `${footprint.title} Footprint SVG`, className: "rounded-md shadow cursor-pointer hover:shadow-lg transition-shadow w-full h-full object-contain" }), _jsx("div", { className: "absolute bottom-2 left-2 bg-white bg-opacity-80 px-2 py-1 text-xs rounded !break-all", children: footprint.title })] }, index))) })] })] })] }));
};
const root = ReactDOM.createRoot(document.body);
root.render(_jsx(FootprintCreator, {}));
