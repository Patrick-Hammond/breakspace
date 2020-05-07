import { LoaderResource } from "pixi.js";
import { ImageSequenceIndex, GetNextInImageSequence, RemoveExtension } from "breakspace/src/_lib/io/Url";
import AssetFactory from "breakspace/src/breakspace/loading/AssetFactory";

export type MiddlewareFunc = (resource: LoaderResource, next: (...params: any[]) => any) => void;

// tslint:disable-next-line: variable-name
export let AnimRegEx = /^.+(?=_f)/;

export function GetSpriteSheetMiddleware(): MiddlewareFunc {

    return (resource: LoaderResource, next: (...params: any[]) => any) => {
        if (resource.data && resource.data.frames) {
            const frames = resource.data.frames;
            for (const frame in frames) {
                if (frames.hasOwnProperty(frame)) {
                    const nameResult = AnimRegEx.exec(frame);
                    if (nameResult) {
                        // animation
                        const name = nameResult[0];
                        const seqIndex = ImageSequenceIndex(frame);

                        if (seqIndex === 0) {
                            let nextFrame: string = frame;
                            const animFrames: string[] = [];
                            while (frames[nextFrame]) {
                                animFrames.push(nextFrame);
                                const nextInSequence = GetNextInImageSequence(nextFrame);
                                if(nextInSequence) {
                                    nextFrame = nextInSequence;
                                }
                            }

                            AssetFactory.inst.Add(name, animFrames);
                            console.log("creating amination " + name);
                        }
                    } else {
                        // image
                        const name = RemoveExtension(frame);
                        AssetFactory.inst.Add(name, [frame]);
                        console.log("creating sprite " + name);
                    }
                }
            }
        }
        next();
    };
}