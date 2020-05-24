import Game from "../Game";
import { RectangleLike } from "../../_lib/math/Geometry";
import { Container, DisplayObject } from "pixi.js";

export interface Group extends Container {
    Update(): Group;
}

export function HGroup(gap: number, ...displayObject: (DisplayObject & RectangleLike)[]): Group {
    const c = new Container() as Group;
    let x = 0;
    c.Update = (): Group => {
        displayObject.forEach(d => {
            d.x = x;
            d.y = 0;
            x += d.width + gap;
            c.addChild(d);
        });
        return c;
    };
    return c.Update();
}

export function RemoveFromParent(displayObject: DisplayObject): DisplayObject {
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

export function CenterScreen(...displayObject: RectangleLike[]): void {
    displayObject.forEach(d => CenterOn(d, Game.inst.screen));
}

export function CenterOn<T extends RectangleLike>(object: T, target: RectangleLike): T {
    object.x = (target.width - object.width)  * 0.5;
    object.y = (target.height - object.height) * 0.5;
    return object;
}