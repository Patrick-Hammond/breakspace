export function GetInterval(ms: number, callback: () => void, context?: any): () => void {

    const handle = setInterval(() => callback.call(context), ms);
    const cancel = () => clearInterval(handle);
    return cancel;
}

export function Wait(ms: number, callback: () => void, context?: any): () => void {
    const handle = setTimeout(() => callback.call(context), ms);
    const cancel = () => clearTimeout(handle);
    return cancel;
}

export type Cancel = () => void;
