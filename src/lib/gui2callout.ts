import { ICanvasRenderingContext } from "@babylonjs/core/Engines/ICanvas";
import { Vector2 } from "@babylonjs/core/Maths/math";
import { Measure } from "@babylonjs/gui/2D/measure";

import { MyLabel } from "./gui2label";
import { DehomoPoint, homoFinite, homoIntersect, HomoLine, HomoPoint, HomoRay, homoVisible } from "./homogenous2d";
import { MyLine } from "./gui2line";

export class MyCalloutLabel extends MyLabel {
    _edge: boolean = false;
    get edge() { return this._edge; }
    set edge(val: boolean) {
        this._edge = val;
        this._markAsDirty();
    }

    constructor(name: string, text: string) {
        super(name, text);
        this.descendantsOnlyPadding = false;
    }

    override _computeAlignment(parentMeasure: Measure, _context: ICanvasRenderingContext): void {
        if (!this.isDirty || !this.anchor.isLinked || parentMeasure.width == 0) return;
        const half = {
            width: this._currentMeasure.width / 2,
            height: this._currentMeasure.height / 2,
        };

        this._currentMeasure.left = this.anchor.x!;
        this._currentMeasure.top = this.anchor.y!;

        if (this._edge) {
            const snapped = snapToEdges(
                new Measure(half.width, half.height, parentMeasure.width - this._currentMeasure.width, parentMeasure.height - this._currentMeasure.height),
                new Vector2(this.anchor.x!, this.anchor.y!)
            );

            if (snapped) {
                this._currentMeasure.left = snapped.x;
                this._currentMeasure.top = snapped.y;
            }
        }

        // margins
        this._currentMeasure.width -= this.paddingLeftInPixels + this.paddingRightInPixels;
        this._currentMeasure.height -= this.paddingTopInPixels + this.paddingBottomInPixels;
        this._currentMeasure.left += this.paddingLeftInPixels;
        this._currentMeasure.top += this.paddingTopInPixels;

        // centering
        this._currentMeasure.left -= half.width;
        this._currentMeasure.top -= half.height;
    }
}

export class MyCalloutLine extends MyLine {
    // drawing anchor1 to anchor2 so that gradient 0-stop is at edge 1
    public override _draw(context: ICanvasRenderingContext): void {
        context.save();

        this._applyStates(context);
        context.lineWidth = this._lineWidth;
        context.setLineDash(this._dash);
        context.strokeStyle = this._getColor(context);

        context.translate(this.anchor1.x!, this.anchor1.y!);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(this.anchor2.x! - this.anchor1.x!, this.anchor2.y! - this.anchor1.y!);
        context.stroke();

        context.restore();
    }
}

export function snapToEdges(parent: Measure, position: Vector2): Vector2 | null {
    const corners = {
        min: new Vector2(parent.left, parent.top),
        max: new Vector2(parent.left + parent.width, parent.top + parent.height),
    };
    const center = {
        x: (corners.min.x + corners.max.x) / 2,
        y: (corners.min.y + corners.max.y) / 2,
    };

    let edges = [
        HomoLine(corners.min, new Vector2(0, +1)), // top
        HomoLine(corners.max, new Vector2(-1, 0)), // right
        HomoLine(corners.max, new Vector2(0, -1)), // bottom
        HomoLine(corners.min, new Vector2(+1, 0)), // left
    ];

    let dir = new Vector2(position.x - center.x, position.y - center.y);
    if (Math.abs(dir.x) <= 1 && Math.abs(dir.y) <= 1) dir = new Vector2(0, -1);
    dir.normalize();

    const pos = new Vector2(position.x, position.y);
    let ray3 = HomoRay(pos, dir);
    let pos3 = HomoPoint(pos);

    const snaps = edges
        .filter((edge) => homoVisible(edge, pos3))
        .map((edge) => homoIntersect(edge, ray3))
        .filter((pnt) => homoFinite(pnt) && pnt.z > 0) // at forward direction only
        .map((pnt) => DehomoPoint(pnt));

    if (snaps.length == 0) return null;

    const dots = snaps.map((pnt) => {
        return {
            pnt,
            dst: Vector2.DistanceSquared(pnt, pos),
        };
    });
    dots.sort((a, b) => a.dst - b.dst);

    const snapped = dots[0].pnt;

    return snapped;
}
