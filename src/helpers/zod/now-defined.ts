/* Define a utility type to make certain keys required */
export type NowDefined<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
