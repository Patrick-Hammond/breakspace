import {Sprite, Texture} from "pixi.js";

enum State {
    UP, OVER, DOWN, DISABLED
}

export default class Button extends Sprite {

    private textures: Texture[];

    constructor(id: string) {
        super();

        this.textures = [
            Texture.from(id + "_up.png"),
            Texture.from(id + "_over.png"),
            Texture.from(id + "_down.png"),
            Texture.from(id + "_disabled.png")
        ]

        this.on("pointerover", () => {
            this.texture = this.textures[State.OVER] || this.textures[State.UP];
        });

        this.on("pointerout", () => {
            this.texture = this.textures[State.UP];
        });

        this.on("pointerdown", () => {
            this.texture = this.textures[State.DOWN] || this.textures[State.UP];
        });

        this.on("pointertap", () => {
            this.texture = this.textures[State.UP];
        });

        this.Enabled = false;
    }

    set Enabled(tf: boolean) {

        this.alpha = 1;
        this.buttonMode = this.interactive = tf;

        if(tf) {
            this.texture = this.textures[State.UP];
        } else {
            this.texture = this.textures[State.DISABLED] || this.textures[State.UP];
            this.alpha = this.textures[State.DISABLED] ? 1 : 0.5;
        }
    }
}
