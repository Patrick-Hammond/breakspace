import Game from "../Game";
import { RectangleLike } from "../../_lib/math/Geometry";

export function RemoveFromParent(displayObject: PIXI.DisplayObject): PIXI.DisplayObject {
    if (displayObject && displayObject.parent) {
        displayObject.parent.removeChild(displayObject);
    }
    return displayObject;
}

// tslint:disable-next-line: ban-types
export function Callback<T extends Function>(onComplete?: T, context?: any, ...params: any): void {
    if(onComplete) {
        onComplete.call(context, ...params);
    }
}

export function CenterScreen(displayObject: RectangleLike): RectangleLike {
    return CenterOn(displayObject, Game.inst.screen);
}

export function CenterOn<T extends RectangleLike>(object: T, target: RectangleLike): T {
    object.x = (target.width - object.width)  * 0.5;
    object.y = (target.height - object.height) * 0.5;
    return object;
}