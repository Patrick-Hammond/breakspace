import Game from "./Game";
import GameComponent from "./GameComponent";
import { RemoveFromParent } from "breakspace/src/breakspace/display/Utils";

export default class SceneManager {
    private scenes: { [id: string]: GameComponent } = {};

    GetScene(id: string): GameComponent {
        return this.scenes[id];
    }

    AddScene(id: string, scene: GameComponent): void {
        this.scenes[id] = scene;
        scene.root.name = id;
    }

    ShowScene(id: string, exclusive: boolean = true): void {
        Object.keys(this.scenes).forEach(key => {
            const scene = this.scenes[key];
            if (key === id) {
                Game.inst.stage.addChild(scene.root);
                scene.root.interactive = true;
                scene.root.interactiveChildren = true;
            } else if (exclusive && scene.root.parent) {
               RemoveFromParent(scene.root);
                scene.root.interactive = false;
                scene.root.interactiveChildren = false;
            }
        });
    }
}
