import NodeCache from "node-cache"

export const cache = new NodeCache({ stdTTL: 2592000, checkperiod: 120 })
