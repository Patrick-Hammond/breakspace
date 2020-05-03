import { EventEmitter } from "eventemitter3";
import { Vec2 } from "../math/Geometry";
import { LowerLimit } from "../math/Utils";
import {Direction} from "../utils/Types";
import { Cancel, Wait } from "../utils/Timing"

export enum GamePadEvents {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected"
}

export default class GamePad extends EventEmitter {
    controllers: Gamepad[] = [];
    private timestampMap: { [buttonId: string]: Cancel | null } = {};
    private button: { touched: boolean; pressed: boolean; value: number } = {
        touched: false,
        pressed: false,
        value: 0
    };
    private stick = new Vec2();
    private debugLog: boolean = true;

    constructor() {
        super();

        const haveEvents = "GamepadEvent" in window;
        const haveWebkitEvents = "WebKitGamepadEvent" in window;
        const connectHandler = (e: GamepadEvent) => this.AddGamePad(e.gamepad);
        const disconnectHandler = (e: GamepadEvent) => this.RemoveGamePad(e.gamepad);

        if (haveEvents) {
            window.addEventListener("gamepadconnected", (e: Event) => connectHandler(e as GamepadEvent));
            window.addEventListener("gamepaddisconnected", (e: Event) => disconnectHandler(e as GamepadEvent));
        } else if (haveWebkitEvents) {
            window.addEventListener("webkitgamepadconnected", (e: Event) => connectHandler(e as GamepadEvent));
            window.addEventListener("webkitgamepaddisconnected", (e: Event) => disconnectHandler(e as GamepadEvent));
        } else {
            setInterval(this.ScanGamePads, 500);
        }
    }

    IsConnected(): boolean {
        return this.controllers.some(e => e != null);
    }

    GetButton(controllerId: number, buttonId: number): GamepadButton | null {
        const controller = this.controllers[controllerId];

        if (!controller) {
            return null;
        }

        let val = controller.buttons[buttonId] as any;
        this.button.pressed = val === 1;
        if (typeof val === "object") {
            this.button.pressed = val.pressed;
            val = val.value;
        }

        this.button.value = val;

        return this.button;
    }

    GetButtonMinTime(ms: number, controllerId: number, buttonId: number): GamepadButton | null {
        const id = controllerId.toString() + buttonId.toString();
        const button = this.GetButton(controllerId, buttonId);
        if(button && button.value === 1 && !this.timestampMap[id]) {
            this.timestampMap[id] = Wait(ms, () => this.timestampMap[id] = null);
            return button;
        }

        return null;
    }

    GetStick(controllerId: number, stickId: number, threshold: number): Vec2 | null {
        const controller = this.controllers[controllerId];

        if (!controller) {
            return null;
        }

        if (stickId * 2 + 1 > controller.axes.length) {
            return null;
        }

        this.stick.Set(LowerLimit(controller.axes[stickId * 2], threshold), LowerLimit(controller.axes[stickId * 2 + 1], threshold));

        return this.stick;
    }

    GetStickDirection(controllerId: number, stickId: number, threshold: number): Direction | null {
        const controller = this.controllers[controllerId];

        if (!controller) {
            return null;
        }

        if (stickId * 2 + 1 > controller.axes.length) {
            return null;
        }

        this.stick.Set(LowerLimit(controller.axes[stickId * 2], threshold), LowerLimit(controller.axes[stickId * 2 + 1], threshold));

        if(this.stick.IsZero()) {
            return "none";
        }

        if(Math.abs(this.stick.x) > Math.abs(this.stick.y)) {
            return this.stick.x > 0 ? "right" : "left";
        }

        return this.stick.y > 0 ? "down" : "up";
    }

    GetDPad(controllerId: number): Direction | null {

        // my 2563-0526-HJD-X reports the dpad as axis 9

        const controller = this.controllers[controllerId];

        if (!controller) {
            return null;
        }

        const axis = controller.axes[9];
        if(axis == null || axis === 0 || axis > 1) {
            return "none";
        }

        if(axis < 0) {
            return axis === -1 ? "up" : "right";
        } else {
            return axis > 0.5 ? "left" : "down";
        }
    }

    private AddGamePad(gamepad: Gamepad) {
        this.Log("connected! " + gamepad.index);
        this.Log("gamepad: " + gamepad.id);
        this.Log("button count " + gamepad.buttons.length);
        this.Log("axes count " + gamepad.axes.length);

        this.controllers[gamepad.index] = gamepad;

        this.emit(GamePadEvents.CONNECTED, gamepad.index);
    }

    private RemoveGamePad(gamepad : Gamepad) {
        this.Log("disconnected! " + gamepad.index);

        this.emit(GamePadEvents.DISCONNECTED, gamepad.index);

        this.controllers.splice(gamepad.index, 1);
    }

    private ScanGamePads() {
        const other = navigator.hasOwnProperty("webkitGetGamepads") ? (navigator as any).call("webkitGetGamepads") : [];
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : other;

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                if (!(gamepads[i].index in this.controllers)) {
                    this.AddGamePad(gamepads[i]);
                } else {
                    this.controllers[gamepads[i].index] = gamepads[i];
                }
            }
        }
    }

    private Log(msg: string) {
        if (this.debugLog) {
            console.log(msg);
        }
    }
}
