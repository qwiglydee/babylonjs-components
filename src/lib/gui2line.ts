import { ICanvasRenderingContext } from "@babylonjs/core/Engines/ICanvas";
import { Control } from "@babylonjs/gui/2D/controls/control";

import { Anchor } from "@lib/gui2anchor";

export class MyLine extends Control {
    _lineWidth = 1;
    public get lineWidth(): number {
        return this._lineWidth;
    }
    public set lineWidth(value: number) {
        if (this._lineWidth === value) return;
        this._lineWidth = value;
        this._markAsDirty();
    }

    _dash = new Array<number>();
    public get dash(): Array<number> {
        return this._dash;
    }
    public set dash(value: Array<number>) {
        if (this._dash === value) return;
        this._dash = value;
        this._markAsDirty();
    }

    anchor1 = new Anchor(this);
    anchor2 = new Anchor(this);

    constructor(name?: string) {
        super(name);
        this._automaticSize = true;
        this.isHitTestVisible = false;
        this._horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    }

    override _measure(): void {
        if (this.anchor1.isLinked && this.anchor2.isLinked) {
            this._currentMeasure.width = Math.abs(this.anchor1.x! - this.anchor2.x!) + this._lineWidth;
            this._currentMeasure.height = Math.abs(this.anchor1.y! - this.anchor2.y!) + this._lineWidth;
        }
    }

    override _computeAlignment(): void {
        if (this.anchor1.isLinked && this.anchor2.isLinked) {
            this._currentMeasure.left = Math.min(this.anchor1.x!, this.anchor2.x!) - this._lineWidth / 2;
            this._currentMeasure.top = Math.min(this.anchor1.y!, this.anchor2.y!) - this._lineWidth / 2;
        }
    }

    public override _draw(context: ICanvasRenderingContext): void {
        context.save();

        this._applyStates(context);
        context.lineWidth = this._lineWidth;
        context.setLineDash(this._dash);
        context.strokeStyle = this._getColor(context);

        context.beginPath();
        context.moveTo(this.anchor1.x!, this.anchor1.y!);
        context.lineTo(this.anchor2.x!, this.anchor2.y!);
        context.stroke();

        context.restore();
    }
}

export class MyBridgeLine extends MyLine {
    override getClassName(): string {
        return "MyBridgeLine";
    }

    // drawing from center to edges so that gradient 0-stop is at center
    public override _draw(context: ICanvasRenderingContext): void {
        context.save();

        this._applyStates(context);
        context.lineWidth = this._lineWidth;
        context.setLineDash(this._dash);
        context.strokeStyle = this._getColor(context);

        const x0 = (this.anchor1.x! + this.anchor2.x!) / 2;
        const y0 = (this.anchor1.y! + this.anchor2.y!) / 2;

        context.translate(this.anchor1.x!, this.anchor1.y!);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(x0 - this.anchor1.x!, y0 - this.anchor1.y!);
        context.stroke();

        context.translate(this.anchor2.x! - this.anchor1.x!, this.anchor2.y! - this.anchor1.y!);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(x0 - this.anchor2.x!, y0 - this.anchor2.y!);
        context.stroke();

        context.restore();
    }
}
