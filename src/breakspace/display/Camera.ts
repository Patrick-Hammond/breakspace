import { ObservableRect, Rectangle, Vec2Like, Vec2 } from "../../_lib/math/Geometry";

export default class Camera {

    private _position = new Vec2();
    private _viewRect = new ObservableRect();

    constructor(
        private size: Vec2Like,
        private _scale: number,
        private limitBounds?: Rectangle
        ) {}

    get viewRect(): ObservableRect {
        return this._viewRect;
    }

    set scale(val: number) {
        this._scale = val;
        this.UpdateViewRect();
    }
    get scale(): number {
        return this._scale;
    }

    MoveTo(pos: Vec2Like): void {
        this._position.Copy(pos);
        this.UpdateViewRect();
    }

    private UpdateViewRect(): void {
        const w = this.size.x * this._scale;
        const h = this.size.y * this._scale;

        this._viewRect.Set(this._position.x - w  * 0.5, this._position.y - h * 0.5, w, h);

        if(this.limitBounds) {
            this._viewRect.x = Math.max(this._viewRect.x, this.limitBounds.left);
            this._viewRect.y = Math.max(this._viewRect.y, this.limitBounds.top);
            this.viewRect.right = Math.min(this.viewRect.right, this.limitBounds.right);
            this.viewRect.bottom = Math.min(this.viewRect.bottom, this.limitBounds.bottom);
        }
    }
}