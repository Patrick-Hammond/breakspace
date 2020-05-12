
import * as PIXI from 'pixi.js';
(window as any).PIXI = PIXI;
// tslint:disable-next-line:no-var-requires
require("pixi-tilemap");
import TileMapModel from "../loading/tilemap/TiledJson";
import { Rectangle } from 'breakspace/src/_lib/math/Geometry';
import Camera from 'breakspace/src/breakspace/display/Camera';

export default class TileMapRenderer extends PIXI.Container {

    constructor(private model: TileMapModel, camera: Camera) {
        super();

        this.model.layers.forEach(layer => {
            if (layer.visible) {
                const l = new (PIXI as any)['tilemap'].CompositeRectTileLayer();
                this.addChild(l);
                if(layer.tiles) {
                    layer.tiles.forEach((tile, i) => {
                        if(tile.texture) {
                            l.addFrame(tile.texture, tile.x, tile.y);
                        }
                    });
                }
                if(layer.type === "imagelayer") {
                    l.addFrame(PIXI.Texture.from(layer.image), layer.x + layer.offsetx, layer.y + layer.offsety);
                }
            }
        });

        camera.viewRect.Observe((rect: Rectangle) => {
            this.pivot.set(rect.x, rect.y);
            this.scale.set(1 /  camera.scale);
        });
    }
}