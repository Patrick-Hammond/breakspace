export type Direction = "up" | "down" | "left" | "right" | "none";
export type RGB = {r: number, g: number, b: number};
export type Dictionary<T> = {[id: string]: T};

// tslint:disable-next-line: variable-name
export const IsPromise = (object: any): object is Promise<any> => typeof object.then === "function";