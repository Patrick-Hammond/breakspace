import {DisplayObject, Sprite, interaction} from "pixi.js";
import { Key } from "../../_lib/io/Keyboard";
import Game from "../Game";

type Draggable = DisplayObject & {dragging: boolean, data: interaction.InteractionData | null, sx: number, sy: number};

export function MakeDraggable(sprite: DisplayObject): void {
    sprite.interactive = true;

    sprite.on("mousedown", (event) => {
        const t = event.currentTarget as Draggable;
        if (!t.dragging) {
            t.data = event.data;
            t.alpha = 0.9;
            t.dragging = true;
            t.sx = t.data.getLocalPosition(sprite).x * sprite.scale.x;
            t.sy = t.data.getLocalPosition(sprite).y * sprite.scale.y;
        }
    });

    sprite.on("mouseup", (event) => {
        const t = event.currentTarget as Draggable;
        if (t.dragging) {
            t.alpha = 1;
            t.dragging = false;
            t.data = null;

            sprite.emit("stopped_dragging");
        }
    });

    sprite.on("mousemove", (event) => {
        const t = event.currentTarget as Draggable;
        if (t.dragging && t.data) {
            const newPosition = t.data.getLocalPosition(t.parent);
            t.position.x = newPosition.x - t.sx;
            t.position.y = newPosition.y - t.sy;

            sprite.emit("dragging", event);
        }
    });

    sprite.on("click", (event) => {
        const t = event.currentTarget as Draggable;
        console.log("(" + t.x + ", " + t.y + ")");
    });
}

export function MoveWithArrowKeys(sprite: DisplayObject): void {
    const keyboard = Game.inst.keyboard;
    const checkKeys = () => {

        if(keyboard.AnyKeyPressed()) {
            if (keyboard.KeyPressed(Key.UpArrow)) {
                sprite.y--;
            }
            if (keyboard.KeyPressed(Key.DownArrow)) {
                sprite.y++;
            }
            if (keyboard.KeyPressed(Key.LeftArrow)) {
                sprite.x--;
            }
            if (keyboard.KeyPressed(Key.RightArrow)) {
                sprite.x++;
            }
            console.log(sprite.position);
        }
    }
    Game.inst.ticker.add(checkKeys);
}
