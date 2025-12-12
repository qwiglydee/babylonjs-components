import { ICanvasRenderingContext } from "@babylonjs/core/Engines/ICanvas";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math";
import { RegisterClass } from "@babylonjs/core/Misc/typeStore";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Measure } from "@babylonjs/gui/2D/measure";
import { DehomoPoint, homoFinite, homoIntersect, HomoLine, HomoPoint, HomoRay, homoVisible } from "./homogenous2d";

export class MyLabel extends Rectangle {
    override getClassName(): string {
        return "MyLabel";
    }

    _textBlock: TextBlock;
    get textBlock() {
        return this._textBlock;
    }

    constructor(name: string, text: string) {
        super(name);
        this.adaptWidthToChildren = true;
        this.adaptHeightToChildren = true;
        this._textBlock = new TextBlock("text", text);
        this._textBlock.resizeToFit = true;
        this._textBlock.textWrapping = false;
        this.addControl(this._textBlock);
    }
}

export class MyEdgeLabel extends MyLabel {
    #cachedProjection?: Vector3;
    override _moveToProjectedPosition(position: Vector3) {
        if (this.#cachedProjection && this.#cachedProjection.equalsWithEpsilon(position)) return;
        this.#cachedProjection = position.clone();

        this.leftInPixels = position.x;
        this.topInPixels = position.y;
    }

    override _computeAlignment(_parentMeasure: Measure, _context: ICanvasRenderingContext): void {
        this._snapToEdges();
        this._currentMeasure.width -= (this.paddingLeftInPixels + this.paddingRightInPixels);
        this._currentMeasure.height -= (this.paddingTopInPixels + this.paddingBottomInPixels);
        this._currentMeasure.left = this.leftInPixels + this.linkOffsetXInPixels - this._currentMeasure.width / 2;
        this._currentMeasure.top = this.topInPixels + this.linkOffsetYInPixels - this._currentMeasure.height / 2;
    }

    _snapToEdges(): void {
        console.debug("snapping...");
        const host = this.host.getSize();
        const center = new Vector2(host.width / 2, host.height / 2); 
        const half = { 
            width: this._currentMeasure.width / 2,
            height: this._currentMeasure.height / 2,
        };
        const corners = {
            min: new Vector2(half.width, half.height),
            max: new Vector2(host.width - half.width, host.height - half.height),
        }
        let edges = [
            HomoLine(corners.min, new Vector2(0, +1)), // top
            HomoLine(corners.max, new Vector2(-1, 0)), // right
            HomoLine(corners.max, new Vector2(0, -1)), // bottom
            HomoLine(corners.min, new Vector2(+1, 0)), // left
        ]

        const pos = new Vector2(this.leftInPixels, this.topInPixels);
        let dir = pos.subtract(center);
        if (Math.abs(dir.x) <= 1 && Math.abs(dir.y) <= 1) dir = new Vector2(0, -1);
        dir.normalize();
        let ray = HomoRay(pos, dir);

        let pos3 = HomoPoint(pos);

        const snaps = edges
            .filter(edge => homoVisible(edge, pos3))
            .map(edge => homoIntersect(edge, ray))
            .filter(pnt => homoFinite(pnt) && pnt.z > 0) // at forward direction only
            .map(pnt => DehomoPoint(pnt));

        if (snaps.length == 0) return;
        
        const dots = snaps.map(pnt => {return { 
            pnt, 
            dst: Vector2.DistanceSquared(pnt, pos)
        }})
        dots.sort((a, b) => a.dst - b.dst);

        const snapped = dots[0].pnt;

        this.linkOffsetXInPixels = snapped.x - pos.x;
        this.linkOffsetYInPixels = snapped.y - pos.y;
    }
}


RegisterClass("GUI.MyLabel", MyLabel);
RegisterClass("GUI.MyEdgeLabel", MyEdgeLabel);
