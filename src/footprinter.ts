import { dip } from "./fn/dip"

export const footprinter = () => {
  const proxy = new Proxy(
    {},
    {
      get: (target: any, prop) => {
        if (prop === "soup") {
          if ("dip" in target) return () => dip(target)
          return () => {
            // TODO improve error
            throw new Error(
              "No function found for footprinter, make sure to specify .dip, .lr, .p, etc.!"
            )
          }
        }
        if (prop === "params") {
          // TODO
          return () => target
        }
        return (v: any) => {
          target[prop] = v ?? true
          return proxy
        }
      },
    }
  )
  return proxy as any
}

export const fp = footprinter
