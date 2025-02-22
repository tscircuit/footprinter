import * as FOOTPRINT_FN from "./fn";
import { isNotNull } from "./helpers/is-not-null";
import { footprintSizes } from "./helpers/passive-fn";
export const string = (def) => {
    let fp = footprinter();
    // special case: 0402, 0603, etc.
    const modifiedDef = (def.length === 4 || def.length === 5) && /^\d+$/.test(def)
        ? `res${def}`
        : def;
    const def_parts = modifiedDef
        .split("_")
        .map((s) => {
        const m = s.match(/([a-z]+)([\(\d\.\+\?].*)?/);
        const [_, fn, v] = m ?? [];
        if (v?.includes("?"))
            return null;
        return { fn: m?.[1], v: m?.[2] };
    })
        .filter(isNotNull);
    for (const { fn, v } of def_parts) {
        fp = fp[fn](v);
    }
    fp.setString(def);
    return fp;
};
export const getFootprintNames = () => {
    return Object.keys(FOOTPRINT_FN);
};
export const getFootprintSizes = () => {
    return footprintSizes;
};
export const getFootprintNamesByType = () => {
    const allFootprintNames = Object.keys(FOOTPRINT_FN);
    const passiveFootprintNames = allFootprintNames.filter((name) => {
        const fn = FOOTPRINT_FN[name];
        return fn.toString().includes("passive(");
    });
    return {
        passiveFootprintNames,
        normalFootprintNames: allFootprintNames.filter((name) => !passiveFootprintNames.includes(name)),
    };
};
export const footprinter = () => {
    const proxy = new Proxy({}, {
        get: (target, prop) => {
            // console.log(prop, target)
            if (prop === "soup" || prop === "circuitJson") {
                if ("fn" in target && FOOTPRINT_FN[target.fn]) {
                    return () => FOOTPRINT_FN[target.fn](target).circuitJson;
                }
                if (!FOOTPRINT_FN[target.fn]) {
                    throw new Error(`Invalid footprint function, got "${target.fn}"${target.string ? `, from string "${target.string}"` : ""}`);
                }
                return () => {
                    // TODO improve error
                    throw new Error(`No function found for footprinter, make sure to specify .dip, .lr, .p, etc. Got "${prop}"`);
                };
            }
            if (prop === "json") {
                if (!FOOTPRINT_FN[target.fn]) {
                    throw new Error(`Invalid footprint function, got "${target.fn}"${target.string ? `, from string "${target.string}"` : ""}`);
                }
                return () => FOOTPRINT_FN[target.fn](target).parameters;
            }
            if (prop === "getFootprintNames") {
                return () => Object.keys(FOOTPRINT_FN);
            }
            if (prop === "params") {
                // TODO
                return () => target;
            }
            if (prop === "setString") {
                return (v) => {
                    target.string = v;
                    return proxy;
                };
            }
            return (v) => {
                if (Object.keys(target).length === 0) {
                    if (`${prop}${v}` in FOOTPRINT_FN) {
                        target[`${prop}${v}`] = true;
                        target.fn = `${prop}${v}`;
                    }
                    else {
                        target[prop] = true;
                        target.fn = prop;
                        if (prop === "res" || prop === "cap") {
                            if (v) {
                                target.imperial = v; // res0402, cap0603 etc.
                            }
                        }
                        else {
                            target.num_pins = Number.isNaN(Number.parseFloat(v))
                                ? undefined
                                : Number.parseFloat(v);
                        }
                    }
                }
                else {
                    // handle dip_w or other invalid booleans
                    if (!v && ["w", "h", "p"].includes(prop)) {
                        // ignore
                    }
                    else {
                        target[prop] = v ?? true;
                    }
                }
                return proxy;
            };
        },
    });
    return proxy;
};
footprinter.string = string;
footprinter.getFootprintNames = getFootprintNames;
export const fp = footprinter;
