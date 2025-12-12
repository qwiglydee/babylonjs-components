import { ICanvasRenderingContext } from "@babylonjs/core/Engines/ICanvas";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { RegisterClass } from "@babylonjs/core/Misc/typeStore";
import { Nullable } from "@babylonjs/core/types";
import { Control } from "@babylonjs/gui/2D/controls/control";

export class MyCalloutLine extends Control {
    private _lineWidth = 1;
    public get lineWidth(): number {
        return this._lineWidth;
    }
    public set lineWidth(value: number) {
        if (this._lineWidth === value) return;
        this._lineWidth = value;
        this._markAsDirty();
    }

    private _dash = new Array<number>();
    public get dash(): Array<number> {
        return this._dash;
    }
    public set dash(value: Array<number>) {
        if (this._dash === value) return;
        this._dash = value;
        this._markAsDirty();
    }

    private _linkedControl?: Control;

    linkWithControl(value: Control) {
        this._linkedControl = value;
        this._markAsDirty();
        this.notRenderable = !!this._linkedMesh && !!this._linkedControl;
    }

    override linkWithMesh(mesh: Nullable<TransformNode>) {
        super.linkWithMesh(mesh);
        this.notRenderable = !!this._linkedMesh && !!this._linkedControl;
    }

    constructor(name?: string) {
        super(name);
        this._automaticSize = true;
        this.isHitTestVisible = false;
        this._horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.notRenderable = true;
    }

    #cachedProjection?: Vector3;
    override _moveToProjectedPosition(position: Vector3) {
        if (this.#cachedProjection && this.#cachedProjection.equalsWithEpsilon(position)) return;
        this.#cachedProjection = position.clone();
        this.p0 = new Vector2(position.x, position.y);
    }

    p0?: Vector2;

    get p1(): Vector2 | undefined {
        return this._linkedControl ? new Vector2(this._linkedControl.centerX, this._linkedControl.centerY) : undefined;
    }

    public override _draw(context: ICanvasRenderingContext): void {
        const p0 = this.p0,
            p1 = this.p1;
        if (!p0 || !p1) return;

        const r = this.p1.subtract(p0);

        context.save();

        this._applyStates(context);
        context.strokeStyle = this._getColor(context);
        context.lineWidth = this._lineWidth;
        context.setLineDash(this._dash);
        context.strokeStyle = this._getColor(context);

        // translating to 0 to make gradient 0-based
        context.translate(p0.x, p0.y);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(r.x, r.y);
        context.stroke();

        context.restore();
    }
}

RegisterClass("MyCalloutLine", MyCalloutLine);
