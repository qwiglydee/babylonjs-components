import { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { MyCalloutLine } from "@lib/gui2callout";
import { MyLabel } from "@lib/gui2label";
import { MyBridgeLine } from "@lib/gui2line";
import { MySpot } from "@lib/gui2spot";
import { formatCSSColor, parseCSSColor } from "@utils/colors";

import { GUI2Element } from "./base";
import { COLORSTYLES, DRAWSTYLES, TEXTSTYLES } from "./css";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Vector3 } from "@babylonjs/core/Maths/math";

@customElement("my2g-dimension")
export class MyGUIDimensionElem extends GUI2Element {
    @property()
    anchors = "";

    _dot1!: MySpot;
    _dot2!: MySpot;
    _line1!: MyCalloutLine;
    _line2!: MyCalloutLine;
    _bridge!: MyBridgeLine;
    _label!: MyLabel;

    override init(): void {
        this._dot1 = new MySpot("anch1");
        this._dot2 = new MySpot("anch2"); 
        this.gui.addControl(this._dot1);
        this.gui.addControl(this._dot2);
        
        this._bridge = new MyBridgeLine("bridge"); 
        this.gui.addControl(this._bridge);
        this._bridge.anchor1.target = this._dot1;
        this._bridge.anchor2.target = this._dot2;
        
        this._line1 = new MyCalloutLine("line1");
        this._line2 = new MyCalloutLine("line2");
        this.gui.addControl(this._line1);
        this.gui.addControl(this._line2);
        this._line1.anchor2.target = this._dot1;
        this._line2.anchor2.target = this._dot2;

        this._label = new MyLabel("label", "");
        this.gui.addControl(this._label);
        this._label.anchor.target = this._bridge;

        this._bridge.zIndex = 1;
        this._dot1.zIndex = 2;
        this._dot2.zIndex = 2;
        this._label.zIndex = 3;

        this._applyStyle(this._dot1, DRAWSTYLES);
        this._applyStyle(this._dot1, ['offset']);
        this._applyStyle(this._dot2, DRAWSTYLES);
        this._applyStyle(this._dot2, ['offset']);
        this._applyStyle(this._bridge, DRAWSTYLES);
        this._bridge.dash = [];
        this._applyStyle(this._line1, DRAWSTYLES);
        this._applyStyle(this._line2, DRAWSTYLES);
        this._applyStyle(this._label);
        this._applyStyle(this._label._textBlock!, TEXTSTYLES);
        this._applyStyle(this._label._textBlock!, COLORSTYLES);

        const R = Math.max(Math.abs(this._dot1.linkOffsetXInPixels), Math.abs(this._dot1.linkOffsetYInPixels))
        const gradient = new RadialGradient(0, 0, 0, 0, 0, R);
        const color = parseCSSColor(this._bridge.color);
        gradient.addColorStop(0.0, formatCSSColor({...color, a: 0.0 }));
        gradient.addColorStop(1.0, formatCSSColor({...color, a: 1.0 }));
        this._line1.gradient = gradient;
        this._line2.gradient = gradient;

        this.babylon.onUpdatedObservable.add(() => this.requestUpdate('anchors'));
    }

    #observers: Observer<any>[] = [];
    #rettach() {
        const targets = this.babylon.querySelectorNodes(this.anchors);
        if (this.#observers.length) this.#observers.forEach(o => o.remove());
        if (targets.length == 2 && targets.every(c => c instanceof TransformNode)) {
            this.toggleVisible(true);
            this._dot1.anchor.target = targets[0];
            this._dot2.anchor.target = targets[1];
            this._line1.anchor1.target = targets[0];
            this._line2.anchor1.target = targets[1];
            this.#observers = [
                targets[0].onAfterWorldMatrixUpdateObservable.add(() => this.#updLabel()),
                targets[1].onAfterWorldMatrixUpdateObservable.add(() => this.#updLabel()),
            ]
        } else {
            this.toggleVisible(false);
            this._dot1.anchor.unlink();
            this._dot2.anchor.unlink();
            this._line1.anchor1.unlink();
            this._line2.anchor1.unlink();
        }
    }

    #updLabel() {
        if (this._dot1.anchor.isLinked && this._dot1.anchor.isLinked) {
            const dist = Vector3.Distance((this._dot1.anchor.target as TransformNode)!.getAbsolutePosition(), (this._dot2.anchor.target as TransformNode).getAbsolutePosition());
            this._label.text = dist.toFixed(1);
        } else {
            this._label.text = "...";
        }
    }

    override dispose(): void {
        this._dot1.dispose();
        this._dot2.dispose();
        this._bridge.dispose();
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._dot1, this._dot2);
    }

    override toggleVisible(enabled: boolean): void {
        this._syncVisible(enabled, this._dot1, this._dot2);
    }

    override update(changes: PropertyValues): void {
        if (changes.has("anchors")) this.#rettach();
        super.update(changes);
    }
}
