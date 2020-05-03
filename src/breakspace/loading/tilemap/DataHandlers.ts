import TileMapModel, {Layer, Tile} from "./TiledJson";
import {inflate, gunzip} from 'zlib';
import { AbstractHandler } from "../../../_lib/patterns/Chain";

abstract class DataHandler extends AbstractHandler<Layer, Promise<void>> {}

export class UnCompress extends DataHandler {

    Handle(layer: Layer): Promise<void> | null {

        if(!layer.compression) {
            return super.Handle(layer);
        }

        return new Promise<void>((resolve, reject) => {
            const onUnzip = (error: Error | null, buffer: Buffer) => {
                if(error) {
                    reject(error);
                };
                layer.data = buffer;
                super.Handle(layer);
                return resolve();
            };

            const zipData = new Buffer(layer.data.trim(), 'base64');
            switch(layer.compression){
                case "gzip": {
                    gunzip(zipData, onUnzip);
                    break;
                }
                case "zlib": {
                    inflate(zipData, onUnzip);
                    break;
                }
                default:
                    reject("Compression format" + layer.compression + " not supported");
            }
        });
    }
}

export class Decode extends DataHandler {

    Handle(layer: Layer): Promise<void> | null {

        if(layer.encoding === "base64") {
            const result: number[] = [];
            const data = layer.compression ? layer.data as Buffer : new Buffer(layer.data.trim(), 'base64');

            for (let i = 0; i < data.length; i += 4) {
                result.push(data.readUInt32LE(i));
            }
            layer.data = result;
        }
        else if(typeof layer.data === "string") {
            layer.data = layer.data.split(",").map(d => parseInt(d));
        }

        return super.Handle(layer);
    }
}

export class CreateTiles extends DataHandler {

    Handle(layer: Layer): Promise<void> | null {
        layer.tiles = [];
        const data: number[] = layer.data;
        data.forEach((d, i) => this.CreateTile(d, i, layer));
        return super.Handle(layer);
    }

    private CreateTile(gid: number, tileIndex: number, layer: Layer): void {

        const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
        const FLIPPED_VERTICALLY_FLAG   = 0x40000000;
        const FLIPPED_DIAGONALLY_FLAG   = 0x20000000;

        const tile: Tile = layer.tiles[tileIndex] = {gid: -1};
        tile.hflip = !!(gid & FLIPPED_HORIZONTALLY_FLAG);
        tile.vflip = !!(gid & FLIPPED_VERTICALLY_FLAG);
        tile.dflip = !!(gid & FLIPPED_DIAGONALLY_FLAG);

        gid &= ~(FLIPPED_HORIZONTALLY_FLAG |
                    FLIPPED_VERTICALLY_FLAG |
                    FLIPPED_DIAGONALLY_FLAG);

        tile.gid = gid;
    }
}

export class ResolveLayerTextures extends DataHandler {

    constructor(private map: TileMapModel) {
        super();
    }

    Handle(layer: Layer): Promise<void> | null {
        for (let i = 0; i < layer.tiles.length; i ++) {
            const tile = layer.tiles[i];
            const globalTileId = tile.gid;
            for (let j = this.map.tilesets.length - 1; j >= 0; j -= 1) {
                const tileSet = this.map.tilesets[j];
                if (tileSet.firstgid <= globalTileId) {
                    const tileId = globalTileId - tileSet.firstgid;

                    const x = i % layer.width;
                    const y = Math.floor(i / layer.width);
                    tile.x = layer.x + x * tileSet.tilewidth;
                    tile.y = layer.y + y * tileSet.tileheight;

                    if(layer.name === "Collisions") {
                        break;
                    }

                    tile.texture = tileSet.textures[tileId];

                    if(tileSet.tiles) {
                        tileSet.tiles.filter(val => val.id === tileId).forEach(t => tile.animation = t.animation);
                    }

                    break;
                }
            }
        }
        return Promise.resolve();
    }
}