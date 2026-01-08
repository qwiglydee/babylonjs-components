import type { ICanvasRenderingContext } from "@babylonjs/core/Engines/ICanvas";
import { serialize } from "@babylonjs/core/Misc/decorators";
import { RegisterClass } from "@babylonjs/core/Misc/typeStore";
import { Control } from "@babylonjs/gui/2D/controls/control";


export class MyDot extends Control {
    override getClassName(): string {
        return "MyDot";
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

    override _draw(context: ICanvasRenderingContext) {
        context.save();
        this._applyStates(context);
        // gradient 0-stop is at center
        context.fillStyle = this._getColor(context);
        
        context.translate(this.centerX, this.centerY);
        context.beginPath();
        // @ts-ignore
        context.ellipse(0, 0, this._radius, this._radius, 0, 0, 2 * Math.PI);
        context.fill();
        context.restore();
    }
}

RegisterClass("BABYLON.GUI.MyDot", MyDot);
