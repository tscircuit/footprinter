import { fp } from "./src/footprinter"
const circuitJson = fp.pdip8().circuitJson()
console.log(JSON.stringify(circuitJson, null, 2))
