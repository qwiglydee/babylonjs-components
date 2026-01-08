import { consume } from "@lit/context";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { Vector3 } from "@babylonjs/core/Maths/math";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Observer } from "@babylonjs/core/Misc/observable";
import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { MyCalloutLine } from "@lib/gui2/callout";
import { COLORSTYLES, DRAWSTYLES, TEXTSTYLES } from "@lib/gui2/css";
import { MyLabel } from "@lib/gui2/label";
import { MyBridgeLine } from "@lib/gui2/line";
import { MySpot } from "@lib/gui2/spot";
import { querySelectorNodes } from "@lib/queryselecting";
import { formatCSSColor, parseCSSColor } from "@utils/colors";

import { GUI2ComponentBase } from "../../base/gui2";
import { modelCtx } from "../../context";
import type { IModelContainer } from "../../interfaces";

@customElement("my2g-dimension")
export class MyGUIDimensionElem extends GUI2ComponentBase {
    @consume({ context: modelCtx, subscribe: true })
    @state({ hasChanged: () => true }) // do not compare
    model!: IModelContainer;

    @property()
    anchor = "";

    @state()
    __targets: TransformNode[] = [];

    get valid(): boolean {
        return this.__targets.length == 2;
    }

    _dot1!: MySpot;
    _dot2!: MySpot;
    _line1!: MyCalloutLine;
    _line2!: MyCalloutLine;
    _bridge!: MyBridgeLine;
    _label!: MyLabel;

    override init(): void {
        this._dot1 = new MySpot("anch1");
        this._dot1.zIndex = 2;
        this._dot2 = new MySpot("anch2");        
        this._dot2.zIndex = 2;
        this._line1 = new MyCalloutLine("line1");
        this._line2 = new MyCalloutLine("line2");
        this._bridge = new MyBridgeLine("bridge"); 
        this._bridge.zIndex = 1;
        this._label = new MyLabel("label", "");
        this._label.zIndex = 3;

        this.applyStyle(this._dot1, DRAWSTYLES);
        this.applyStyle(this._dot1, ['offset']);
        this.applyStyle(this._dot2, DRAWSTYLES);
        this.applyStyle(this._dot2, ['offset']);
        this.applyStyle(this._bridge, DRAWSTYLES);
        this._bridge.dash = [];
        this.applyStyle(this._line1, DRAWSTYLES);
        this.applyStyle(this._line2, DRAWSTYLES);
        this.applyStyle(this._label);
        this.applyStyle(this._label._textBlock!, TEXTSTYLES);
        this.applyStyle(this._label._textBlock!, COLORSTYLES);

        const R = Math.max(Math.abs(this._dot1.linkOffsetXInPixels), Math.abs(this._dot1.linkOffsetYInPixels))
        const gradient = new RadialGradient(0, 0, 0, 0, 0, R);
        const color = parseCSSColor(this._bridge.color);
        gradient.addColorStop(0.0, formatCSSColor({...color, a: 0.0 }));
        gradient.addColorStop(1.0, formatCSSColor({...color, a: 1.0 }));
        this._line1.gradient = gradient;
        this._line2.gradient = gradient;

        this.addControl(this._dot1);
        this.addControl(this._dot2);
        this.addControl(this._line1);
        this.addControl(this._line2);
        this.addControl(this._bridge);
        this.addControl(this._label);
        this._bridge.anchor1.target = this._dot1;
        this._bridge.anchor2.target = this._dot2;        
        this._line1.anchor2.target = this._dot1;
        this._line2.anchor2.target = this._dot2;
        this._label.anchor.target = this._bridge;

        if (this.anchor) this.#rescan();
        if (this.__targets.length == 2) this.#rettach();
    }

    override dispose(): void {
        this._dot1.dispose();
        this._dot2.dispose();
        this._bridge.dispose();
    }

    override update(changes: PropertyValues) {
        if (changes.has('anchor') || changes.has('model')) this.#rescan();
        if (changes.has('__targets')) {
            if (this.valid) this.#rettach();
            else this.#reset();
        }

        this.visible = this.valid && this.__targets.every(t => t.isVisible);

        if (changes.has("enabled")) this._syncEnabled(this.enabled, this._dot1, this._dot2, this._line1, this._line2, this._bridge, this._label);
        if (changes.has("visible")) this._syncVisible(this.visible, this._dot1, this._dot2, this._line1, this._line2, this._bridge, this._label);
        super.update(changes);
    }

    #rescan() {
        this.__targets = this.anchor ? querySelectorNodes(this.model, this.anchor) as TransformNode[] : [];
    }

    #observers: Observer<any>[] = [];

    #reset() {
        this.#observers.forEach(_ => _.remove());
        this.#observers = [];

        this._dot1.anchor.unlink();
        this._dot2.anchor.unlink();
        this._line1.anchor1.unlink();
        this._line2.anchor1.unlink();
    }

    #rettach() {
        const [t1, t2] = this.__targets;
        if (this._dot1.anchor.target === t1 && this._dot2.anchor.target === t2) return;
        
        this.#observers.forEach(_ => _.remove());
        this.#observers = [
            t1.onAfterWorldMatrixUpdateObservable.add(() => this.#relabel()),
            t2.onAfterWorldMatrixUpdateObservable.add(() => this.#relabel()),
        ];

        this._dot1.anchor.target = t1;
        this._dot2.anchor.target = t2;
        this._line1.anchor1.target = t1;
        this._line2.anchor1.target = t2;
    }

    #relabel() {
        if (!this.visible) return;
        if (this.valid) {
            const [t1, t2] = this.__targets;
            const dist = Vector3.Distance(t1.getAbsolutePosition(), t2.getAbsolutePosition());
            this._label.text = dist.toFixed(2);
        } else {
            this._label.text = "...";
        }
    }
}

