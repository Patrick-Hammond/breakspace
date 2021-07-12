import {AnimatedSprite, Sprite, Texture, utils, BitmapText, Loader, LoaderResource} from "pixi.js";
import { Callback } from "breakspace/src/breakspace/display/Utils";

type LoaderCallback = (loader: Loader, resources: Partial<Record<string, LoaderResource>>) => void;

export interface AssetConfig {
    rootPath: string;
    chunks: AssetChunk[];
    data: any;
}

export interface AssetChunk {
    name: string;
    fonts: string[];
    sounds: string[];
    spritesheets: string[];
    data: any;
}

export default class AssetFactory {
    private static _inst: AssetFactory;
    public static get inst(): AssetFactory {
        if (!AssetFactory._inst) {
            AssetFactory._inst = new AssetFactory();
        }
        return AssetFactory._inst;
    }

    private names: { sprites: string[]; anims: string[] } = { sprites: [], anims: [] };
    private registry: { [name: string]: string[] } = {};
    private config: AssetConfig;

    get SpriteNames(): string[] {
        return this.names.sprites;
    }

    get AnimationNames(): string[] {
        return this.names.anims;
    }

    get RootPath(): string {
        return this.config.rootPath;
    }

    GetConfig(): AssetConfig {
        return this.config;
    }

    GetAssetChunk(name: string): AssetChunk {
        const chunks = this.config.chunks.filter(c => c.name === name);
        if(chunks.length) {
            return chunks[0];
        } else {
            throw new Error("Asset Factory - error, chunk " + name + " not found.");
        }
    }

    LoadConfig(assetConfigPath: string, cb?: LoaderCallback): void {
        PIXI.Loader.shared.add(assetConfigPath).load((loader, resources) => {
            this.config = loader.resources[assetConfigPath].data as AssetConfig;
            Callback(cb, this, [loader, resources]);
        });
    }

    LoadChunk(name: string, cb?: LoaderCallback): void {
        const chunk = this.GetAssetChunk(name);
        const loader = PIXI.Loader.shared;
        loader.baseUrl = this.config.rootPath;
        [...chunk.fonts, ...chunk.sounds, ...chunk.spritesheets].forEach(a => loader.add(a));
        loader.load(cb);
    }

    Add(name: string, frameNames: string[], textures?: Texture[]): void {
        if (textures) {
            frameNames.forEach((frameName, index) => (utils.TextureCache[frameName] = textures[index]));
        }
        this.registry[name] = frameNames;
        frameNames.length === 1 ? this.names.sprites.push(name) : this.names.anims.push(name);
    }

    Create(name: string): Sprite | AnimatedSprite {
        if (this.SpriteNames.indexOf(name) > -1) {
            return this.CreateSprite(name);
        } else if (this.AnimationNames.indexOf(name) > -1) {
            return this.CreateAnimatedSprite(name);
        }

        throw new Error("Asset Factory - error " + name + " not found.");
    }

    CreateTexture(name: string): Texture {
        return Texture.from(this.registry[name][0]);
    }

    CreateSprite(name: string): Sprite {
        return Sprite.from(this.registry[name][0]);
    }

    CreateAnimatedSprite(name: string): AnimatedSprite {
        return AnimatedSprite.fromFrames(this.registry[name]);
    }

    CreateBitmapText(name: string, size: number): BitmapText {
        return new BitmapText("", { font: { name, size } });
    }

    CreateDTS(): void {
        const sprites = this.names.sprites.map(s => `${s} = "${s}"`).join(", ");
        const animations = this.names.anims.map(a => `${a} = "${a}"`).join(", ");
        const dts = `
            export const enum Sprites {${sprites}}
            export const enum Animations {${animations}};
        `;
        console.log(dts);
    }
}
