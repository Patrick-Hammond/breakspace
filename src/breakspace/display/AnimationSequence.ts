import {AnimatedSprite, Sprite} from "pixi.js";
import AssetFactory from "../loading/AssetFactory";
import {Dictionary} from "../../_lib/utils/Types";
import {Callback} from "./Utils";

export class AnimationSequence {

    public root = new Sprite();
    private animations: Dictionary<AnimatedSprite> = {};
    private currentClip: AnimatedSprite;

    constructor(clipNames: string[]) {
        clipNames.forEach(name => {
            const anim = AssetFactory.inst.CreateAnimatedSprite(name);
            anim.animationSpeed = 0.1;
            this.animations[name] = anim;
        });
    }

    get Current(): AnimatedSprite {
        return this.currentClip;
    }

    Play(clipName: string, onComplete ?: () => void): AnimatedSprite {
        const clip = this.animations[clipName];
        clip.name = clipName;
        clip.loop = false;
        clip.play();
        (clip.onComplete as any) = onComplete;
        (clip.onLoop as any) = null;

        this.root.removeChildren();
        this.root.addChild(clip);

        this.currentClip = clip;
        return clip;
    }

    PlayLooped(clipName: string, onLoop ?: () => void): AnimatedSprite {
        const clip = this.Play(clipName);
        clip.loop = true;
        (clip.onLoop as any) = onLoop;
        return clip;
    }

    PlaySequence(clipsNames: string[], onComplete ?: () => void): void {
        const playNext = (index: number = 0) => {
            if(index < clipsNames.length) {
                this.Play(clipsNames[index], () => playNext(++index));
            } else {
                Callback(onComplete);
            }
        }
        playNext(0);
    }

    Stop(): void {
        Object.keys(this.animations).forEach(key => this.animations[key].stop());
    }
}
