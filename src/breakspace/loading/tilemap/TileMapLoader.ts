import { Loader, Rectangle, Texture, BaseTexture } from "pixi.js";
import TileMapModel, {TileSet, Layer} from '../tilemap/TiledJson';
import { UnCompress, Decode, CreateTiles, ResolveLayerTextures } from "./DataHandlers";
import { Chain } from "../../../lib/patterns/Chain";

export async function LoadTileMap(name: string, url: string): Promise<TileMapModel> {
    return new Promise((resolve, reject) => {
        Loader.shared
        .add(name, url)
        .load((loader, resources) => {
            const mapModel: TileMapModel = loader.resources[name].data;

            mapModel.tilesets.forEach(tileset => {
                CreateTilesetTextures(tileset);
            });

            const process = Chain<Layer, Promise<void>>(
                new UnCompress(), new Decode(), new CreateTiles(), new ResolveLayerTextures(mapModel)
                );
            Promise.all(mapModel.layers.map(layer =>  process.Handle(layer)))
            .then(() => resolve(mapModel))
            .catch((error: Error) => reject(error));
        });
    });
}

function CreateTilesetTextures(tileSet: TileSet): void {
    tileSet.textures = [];
    const baseTexture = BaseTexture.from("assets/" + tileSet.image);
    for (let y = 0; y < tileSet.imageheight; y += tileSet.tileheight) {
      for (let x = 0; x < tileSet.imagewidth; x += tileSet.tilewidth) {
        const frame = new Rectangle(x, y, tileSet.tilewidth, tileSet.tileheight)
        tileSet.textures.push(new Texture(baseTexture, frame))
      }
    }
}