import { consume } from "@lit/context";
import type { PropertyValues } from "lit-element";
import { customElement, property, state } from "lit-element/decorators.js";

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
import { debug } from "@utils/debug";

@customElement("b2g-dimension")
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

    _dots!: { 1: MySpot; 2: MySpot };
    _lines!: { 1: MyCalloutLine; 2: MyCalloutLine };
    _label!: MyLabel;

    override init(): void {
        const dots = { 1: new MySpot("anch1"), 2: new MySpot("anch2") };
        const lines = { 1: new MyCalloutLine("line1"), 2: new MyCalloutLine("line1") };
        const bridge = new MyBridgeLine("bridge");
        const label = new MyLabel("label", "");

        this.applyStyle(dots[1], DRAWSTYLES);
        this.applyStyle(dots[1], ["offset"]);
        this.applyStyle(dots[2], DRAWSTYLES);
        this.applyStyle(dots[2], ["offset"]);
        this.applyStyle(lines[1], DRAWSTYLES);
        this.applyStyle(lines[2], DRAWSTYLES);
        this.applyStyle(bridge, DRAWSTYLES);
        bridge.dash = [];
        this.applyStyle(label);
        this.applyStyle(label._textBlock!, TEXTSTYLES);
        this.applyStyle(label._textBlock!, COLORSTYLES);

        const R = Math.max(Math.abs(dots[1].linkOffsetXInPixels), Math.abs(dots[1].linkOffsetYInPixels));
        const gradient = new RadialGradient(0, 0, 0, 0, 0, R);
        const color = parseCSSColor(bridge.color);
        gradient.addColorStop(0.0, formatCSSColor({ ...color, a: 0.0 }));
        gradient.addColorStop(1.0, formatCSSColor({ ...color, a: 1.0 }));
        lines[1].gradient = gradient;
        lines[2].gradient = gradient;

        dots[1].zIndex = 2;
        dots[2].zIndex = 2;
        lines[1].zIndex = 2;
        lines[2].zIndex = 2;
        bridge.zIndex = 1;
        label.zIndex = 3;

        this.addControls(dots[1], dots[2], lines[1], lines[2], bridge, label);
        this._dots = dots;
        this._lines = lines;
        this._label = label;

        lines[1].anchor2.target = dots[1];
        lines[2].anchor2.target = dots[2];
        bridge.anchor1.target = dots[1];
        bridge.anchor2.target = dots[2];
        label.anchor.target = bridge;

        if (this.anchor) this.#rescan();
        if (this.__targets.length == 2) this.#rettach();
    }

    override update(changes: PropertyValues) {
        if (changes.has("anchor") || changes.has("model")) this.#rescan();
        if (changes.has("__targets")) {
            if (this.valid) this.#rettach();
            else this.#detach();
        }

        this.visible = this.valid && this.__targets.every((_) => _.isVisible);
        super.update(changes);
    }

    #rescan() {
        this.__targets = this.anchor ? (querySelectorNodes(this.model, this.anchor) as TransformNode[]) : [];
    }

    #observers: Observer<any>[] = [];

    #detach() {
        this.#observers.forEach((_) => _.remove());
        this.#observers = [];
        this._dots[1].anchor.target = null;
        this._dots[2].anchor.target = null;
        this._lines[1].anchor1.target = null;
        this._lines[2].anchor1.target = null;
    }

    #rettach() {
        const [t1, t2] = this.__targets;
        if (this._dots[1].anchor.target === t1 && this._dots[2].anchor.target === t2) return;

        this.#observers.forEach((_) => _.remove());
        this.#observers = this.__targets.map((_) => _.onAfterWorldMatrixUpdateObservable.add(() => this.#relabel()));

        this._dots[1].anchor.target = t1;
        this._dots[2].anchor.target = t2;
        this._lines[1].anchor1.target = t1;
        this._lines[2].anchor1.target = t2;
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
