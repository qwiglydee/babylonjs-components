import { Animation } from "@babylonjs/core/Animations/animation";
import type { ICanvasRenderingContext } from "@babylonjs/core/Engines/ICanvas";
import { RegisterClass } from "@babylonjs/core/Misc/typeStore";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { serialize } from "@babylonjs/core/Misc/decorators";

import { Anchor } from "./anchor";

export class MySpot extends Control {
    override getClassName(): string {
        return "MySpot";
    }

    @serialize()
    _radius: number = 4;
    get radius() { return this._radius; }
    set radius(value: number) {
        this.widthInPixels = value * 2;
        this.heightInPixels = value * 2;
        this._radius = value;
        this._markAsDirty();
    }

    anchor = new Anchor(this);

    override _measure(): void {
        this._currentMeasure.width = this.widthInPixels;
        this._currentMeasure.height = this.heightInPixels;
    }

    override _computeAlignment(): void {
        if (this.anchor.isLinked) {
            this._currentMeasure.left = this.anchor.x! - this._radius;
            this._currentMeasure.top = this.anchor.y! - this._radius;
        }
    }

    static createBlinkingAnimation(fps: number, frames: number): Animation {
        const a = new Animation("blinking", "alpha", fps, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT); 
        a.setKeys([
            { frame: frames * 0, value: 0 },
            { frame: frames * 0.5, value: 1.0},
            { frame: frames * 1.0, value: 0 },
        ])
        return a;
    }

    override _draw(context: ICanvasRenderingContext) {
        context.save();
        this._applyStates(context);
        context.translate(this.centerX, this.centerY);
        context.beginPath();
        // @ts-ignore
        context.ellipse(0, 0, this._radius, this._radius, 0, 0, 2 * Math.PI);
        context.fill();
        context.restore();
    }
}

RegisterClass("BABYLON.GUI.MySpot", MySpot);
