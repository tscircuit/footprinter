import { fp } from "../../dist/index.js"

declare const footprint: string
const definition = fp.string(footprint).json()

if (definition.fn === "usbcmidmount") {
  const depth: number | undefined = definition.shelldepth
  const front: number = definition.bodybottom
}

// @ts-expect-error json() returns one definition
definition.map(() => {})
