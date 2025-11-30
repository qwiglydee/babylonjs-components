import type { ICanvasRenderingContext } from "@babylonjs/core/Engines/ICanvas";
import { RegisterClass } from "@babylonjs/core/Misc/typeStore";
import type { Nullable } from "@babylonjs/core/types";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { GradientColorStop } from "@babylonjs/gui/2D/controls/gradient/BaseGradient";
import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { Measure } from "@babylonjs/gui/2D/measure";
import { RGB, formatCSSColor, parseCSSColor } from "@utils/colors";
import { Animation } from "@babylonjs/core/Animations/animation";

export class MySpot extends Control {
    override getClassName(): string {
        return "MySpot";
    }

    static createGradientStops(color: RGB): GradientColorStop[] {
        return [
            { offset: 0.0, color: formatCSSColor({ ...color, a: 1.0 }) },
            { offset: 0.5, color: formatCSSColor({ ...color, a: 1.0 }) },
            { offset: 0.75, color: formatCSSColor({ ...color, a: 0.5 }) },
            { offset: 1.0, color: formatCSSColor({ ...color, a: 0.0 }) },
        ];
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

    get radius(): number {
        return 0.5 * Math.max(this.widthInPixels, this.heightInPixels);
    }

    public override _draw(context: ICanvasRenderingContext, _invalidatedRectangle?: Nullable<Measure>): void {
        context.save();

        const { left, top, width, height } = this._currentMeasure;
        const r = 0.5 * Math.max(width, height);

        context.translate(left + r, top + r);

        context.beginPath();
        // @ts-ignore
        context.ellipse(0, 0, r, r, 0, 0, 2 * Math.PI);
        context.fill();

        context.restore();
    }

    _updateGradient() {
        const gradient = new RadialGradient(0, 0, 0, 0, 0, this.radius);
        const color = parseCSSColor(this.color);
        MySpot.createGradientStops(color).forEach((s) => gradient.addColorStop(s.offset, s.color));
        this.gradient = gradient;
    }
}

RegisterClass("BABYLON.GUI.MySpot", MySpot);
