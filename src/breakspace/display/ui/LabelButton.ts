import {Container, Sprite, interaction} from "pixi.js";
import Button from "breakspace/src/breakspace/display/ui/Button";
import { CenterOn } from "breakspace/src/breakspace/display/Utils";

export default class LabelButton extends Container {

    private button: Button;

    constructor(id: string, labelId: string) {
        super();

        const bubble = (ev: interaction.InteractionEvent) => {
            this.emit(ev.type);
        };

        this.button = new Button(id);
        this.button.on("pointerover", bubble);
        this.button.on("pointerout",  bubble);
        this.button.on("pointerdown", bubble);
        this.button.on("pointertap",  bubble);

        const label = Sprite.from(labelId + ".png");
        CenterOn(label, this.button);

        this.addChild(this.button, label);
    }

    set Enabled(tf: boolean) {

        this.button.Enabled = tf;
    }
}
