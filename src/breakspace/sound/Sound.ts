import sound from 'pixi-sound';
import {IsPromise} from '../../_lib/utils/Types';

export type SoundInstance = sound.IMediaInstance | null;

export class Sound {
    Play(name: string): void {
        if(sound.exists(name)) {
            sound.play(name);
        } else {
            console.log("can't find sound " + name);
        }
    }

    Stop(name: string): void {
        if(sound.exists(name)) {
            sound.stop(name);
        } else {
            console.log("can't find sound " + name);
        }
    }

    PlaySprite(sprite: string, clip: string): SoundInstance {
        const s = this.GetSprite(sprite, clip);
        if(s) {
            const instance = s.sprites[clip].play();
            if(IsPromise(instance)) {
                console.log("clip " + clip + " on sound sprite " + sprite + " not loaded");
                return null;
            }
            return instance as sound.IMediaInstance;
        }

        return null;
    }

    StopSprite(sprite: string, clip: string): void {
        const s = this.GetSprite(sprite, clip);
        if(s) {
            s.stop();
        }
    }

    private GetSprite(sprite: string, clip: string): sound.Sound | null {
        if(sound.exists(sprite)) {
            const s = sound.find(sprite);
            if(s.sprites && s.sprites[clip]) {
                return s;
            } else {
                console.log("can't find clip " + clip + " on sound sprite " + sprite);
                return null;
            }
        }

        console.log("can't find sound sprite " + sprite);
        return null;
    }
}