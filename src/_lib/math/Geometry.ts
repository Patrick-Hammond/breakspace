import { Callback } from "breakspace/src/breakspace/display/Utils";
import { Wait, Cancel } from "breakspace/src/_lib/utils/Timing";
import {NullFunction } from "breakspace/src/_lib/patterns/FunctionUtils";

export type Vec2Like = { x: number; y: number };
export class Vec2 {
    constructor(public x: number = 0, public y: number = 0) {}

    get length(): number {
        if (this.IsZero()) { return 0; }
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    get normalized(): Vec2Like {
        const length = this.length;
        if (length === 0) { return { x: 0, y: 0 }; }
        return { x: this.x / length, y: this.y / length };
    }

    IsZero(): boolean {
        return this.x === 0 && this.y === 0;
    }

    Set(x: number, y?: number): Vec2 {
        this.x = x;
        this.y = y != null ? y : x;
        return this;
    }

    Offset(x: number, y?: number): Vec2 {
        this.x += x;
        this.y += y != null ? y : x;
        return this;
    }

    Copy(point: Vec2Like): void {
        this.x = point.x;
        this.y = point.y;
    }

    Clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    Equals(point: Vec2Like): boolean;
    Equals(x: number, y: number): boolean;
    Equals(x: number | Vec2Like, y?: number): boolean {
        if(typeof x === "number") {
            return this.x === x && this.y === y;
        }

        return this.x === x.x && this.y === x.y;
    }
}

export type RectangleLike = { x: number; y: number; width: number; height: number };
export class Rectangle {

    set x(val: number) {
        this._x = val;
    }
    get x(): number {
        return this._x;
    }

    set y(val: number) {
        this._y = val;
    }
    get y(): number {
        return this._y;
    }

    set width(val: number) {
        this._width = val;
    }
    get width(): number {
        return this._width;
    }

    set height(val: number) {
        this._height = val;
    }
    get height(): number {
        return this._height;
    }

    get left(): number {
        return this._x;
    }
    get top(): number {
        return this._y;
    }
    set right(val: number) {
        this._x = val - this._width;
    }
    get right(): number {
        return this._x + this._width;
    }
    set bottom(val: number) {
        this._y = val - this._height;
    }
    get bottom(): number {
        return this._y + this._height;
    }

    get topLeft(): Vec2Like {
        return { x: this._x, y: this._y };
    }
    get topRight(): Vec2Like {
        return { x: this._x + this._width, y: this._y };
    }
    get bottomLeft(): Vec2Like {
        return { x: this._x, y: this._y + this._height };
    }
    get bottomRight(): Vec2Like {
        return { x: this._x + this._width, y: this._y + this._height };
    }

    get centerLeft(): Vec2Like {
        return { x: this._x, y: this._y + this._height * 0.5 };
    }
    get centerTop(): Vec2Like {
        return { x: this._x + this._width * 0.5, y: this._y };
    }
    get centerRight(): Vec2Like {
        return { x: this._x + this._width, y: this._y + this._height * 0.5 };
    }
    get centerBottom(): Vec2Like {
        return { x: this._x + this._width * 0.5, y: this._y + this._height };
    }
    get center(): Vec2Like {
        return { x: this._x + this._width * 0.5, y: this._y + this._height * 0.5 };
    }

    static TEMP = new Rectangle();

    static Equals(rect: RectangleLike): boolean {
        return Rectangle.TEMP.Equals(rect);
    }

    constructor(protected _x: number = 0, protected _y: number = 0, protected _width: number = 0, protected _height: number = 0) {}

    Set(x: number, y: number, width?: number, height?: number): Rectangle {
        this._x = x;
        this._y = y;
        if (width) {
            this._width = width;
        }
        if (height) {
            this._height = height;
        }
        return this;
    }

    Offset(x: number, y: number): Rectangle {
        this._x += x;
        this._y += y;
        return this;
    }

    Scale(amount: number): Rectangle {
        this._x *= amount;
        this._y *= amount;
        this._width *= amount;
        this._height *= amount;
        return this;
    }

    ContainsPoint(point: Vec2Like): boolean {
        return this.Contains(point.x, point.y);
    }

    Contains(px: number, py: number): boolean {
        if (px < this._x || px > this.right || py < this._y || py > this.bottom) {
            return false;
        }
        return true;
    }

    Equals(rect: RectangleLike): boolean {
        if(!rect) {
            return false;
        }
        return  rect.x === this._x &&
                rect.y === this._y &&
                rect.width === this._width &&
                rect.height === this._height;
    }

    Copy(rect: RectangleLike): Rectangle {
        this._x = rect.x;
        this._y = rect.y;
        this._width = rect.width;
        this._height = rect.height;
        return this;
    }

    Clone(): Rectangle {
        return new Rectangle(this._x, this._y, this._width, this._height);
    }
}

export type Vec3Like = { x: number; y: number; z: number };

export class ObservableRect extends Rectangle {

    private cancel: Cancel = NullFunction;
    private onChangeCallback: (rect: Rectangle) => void;

    set x(val: number) {
        this._x = val;
        this.OnChanged();
    }
    get x(): number {
        return this._x;
    }
    set y(val: number) {
        this._y = val;
        this.OnChanged();
    }
    get y(): number {
        return this._y;
    }
    set width(val: number) {
        this._width = val;
        this.OnChanged();
    }
    get width(): number {
        return this._width;
    }
    set height(val: number) {
        this._height = val;
        this.OnChanged();
    }
    get height(): number {
        return this._height;
    }
    set right(val: number) {
        this._x = val - this._width;
        this.OnChanged();
    }
    get right(): number {
        return this._x + this._width;
    }
    set bottom(val: number) {
        this._y = val - this._height;
        this.OnChanged();
    }
    get bottom(): number {
        return this._y + this._height;
    }

    Set(x: number, y: number, width?: number, height?: number): Rectangle {
        super.Set(x, y, width, height);
        this.OnChanged();
        return this;
    }

    Offset(x: number, y: number): Rectangle {
        super.Offset(x, y);
        this.OnChanged();
        return this;
    }

    Scale(amount: number): Rectangle {
        super.Scale(amount);
        this.OnChanged();
        return this;
    }

    Observe(cb: (rect: Rectangle) => void): void {
        this.onChangeCallback = cb;
    }

    protected OnChanged(): void {
        this.cancel();
        this.cancel = Wait(1, () => Callback(this.onChangeCallback, this, this));
    }
}