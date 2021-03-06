
import * as PIXI from 'pixi.js';
(window as any).PIXI = PIXI;
// tslint:disable-next-line:no-var-requires
require("pixi-tilemap");
import TileMapModel from "../loading/tilemap/TiledJson";
import { Rectangle } from 'breakspace/src/_lib/math/Geometry';
import Camera from 'breakspace/src/breakspace/display/Camera';

export default class TileMapRenderer extends PIXI.Container {

    public readonly overlay = new PIXI.Container();

    constructor(camera: Camera) {
        super();

        camera.viewRect.Observe((rect: Rectangle) => {
            this.pivot.set(rect.x, rect.y);
            this.scale.set(1 /  camera.scale);
        });
    }

    SetMapModel(model: TileMapModel): void {
        model.layers.forEach(layer => {
            if (layer.visible) {
                const tilemapLayer = new (PIXI as any)['tilemap'].CompositeRectTileLayer();
                this.addChild(tilemapLayer, this.overlay);
                if(layer.tiles) {
                    layer.tiles.forEach((tile, i) => {
                        if(tile.texture) {
                            tilemapLayer.addFrame(tile.texture, tile.x, tile.y);
                        }
                    });
                }
                if(layer.type === "imagelayer") {
                    tilemapLayer.addFrame(PIXI.Texture.from(layer.image), layer.x + layer.offsetx, layer.y + layer.offsety);
                }
            }
        });
    }
}
