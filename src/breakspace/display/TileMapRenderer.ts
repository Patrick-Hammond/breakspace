
import * as PIXI from 'pixi.js';
(window as any).PIXI = PIXI;
// tslint:disable-next-line:no-var-requires
require("pixi-tilemap");
import TileMapModel from "../loading/tilemap/TiledJson";

export default class TileMapRenderer extends PIXI.Container {

    constructor(private model: TileMapModel) {
        super();

        this.model.layers.forEach(layer => {
            if (layer.name !== 'Collisions') {
                const l = new (PIXI as any)['tilemap'].CompositeRectTileLayer();
                this.addChild(l);
                if(layer.tiles) {
                    layer.tiles.forEach((tile, i) => {
                        if(tile.texture) {
                            l.addFrame(tile.texture, tile.x, tile.y);
                        }
                    });
                }
            }
        });
    }
}