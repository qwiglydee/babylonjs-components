import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { Vector3 } from "@babylonjs/core/Maths/math";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Observer } from "@babylonjs/core/Misc/observable";
import { MyCalloutLine } from "@lib/gui2/callout";
import { COLORSTYLES, DRAWSTYLES, TEXTSTYLES } from "@lib/gui2/css";
import { MyLabel } from "@lib/gui2/label";
import { MyBridgeLine } from "@lib/gui2/line";
import { MySpot } from "@lib/gui2/spot";
import { querySelectorNodes } from "@lib/queryselecting";

import { GUI2ComponentBase } from "../../base/gui2";

@customElement("my2g-dimension")
export class MyGUIDimensionElem extends GUI2ComponentBase {
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

        // FIXME
        // const R = Math.max(Math.abs(this._dot1.linkOffsetXInPixels), Math.abs(this._dot1.linkOffsetYInPixels))
        // const gradient = new RadialGradient(0, 0, 0, 0, 0, R);
        // const color = parseCSSColor(this._bridge.color);
        // gradient.addColorStop(0.0, formatCSSColor({...color, a: 0.0 }));
        // gradient.addColorStop(1.0, formatCSSColor({...color, a: 1.0 }));
        // this._line1.gradient = gradient;
        // this._line2.gradient = gradient;

        // FIXME
        this.main.scene.onNewMeshAddedObservable.add(this.#onupdate);
        this.main.scene.onMeshRemovedObservable.add(this.#onupdate);
    }

    override dispose(): void {
        this._dot1.dispose();
        this._dot2.dispose();
        this._bridge.dispose();
    }

    override update(changes: PropertyValues) {
        if (changes.has("anchors")) this.#rettach();
        if (changes.has("enabled")) this._syncEnabled(this.enabled, this._dot1, this._dot1, this._line1, this._line2, this._bridge);
        if (changes.has("visible")) this._syncVisible(this.visible, this._dot1, this._dot1, this._line1, this._line2, this._bridge);
        super.update(changes);
    }

    #onupdate = () => {
        this.#rettach();
    }

    #observers: Observer<any>[] = [];
    #rettach() {
        // FIXME: skip if anchors not changed
        const targets = querySelectorNodes(this.main.scene, this.anchors);
        if (this.#observers.length) this.#observers.forEach(o => o.remove());
        if (targets.length == 2 && targets.every(c => c instanceof TransformNode)) {
            this.visible = true;
            this._dot1.anchor.target = targets[0];
            this._dot2.anchor.target = targets[1];
            this._line1.anchor1.target = targets[0];
            this._line2.anchor1.target = targets[1];
            this.#observers = [
                targets[0].onAfterWorldMatrixUpdateObservable.add(() => this.#updLabel()),
                targets[1].onAfterWorldMatrixUpdateObservable.add(() => this.#updLabel()),
            ]
        } else {
            this.visible = false;
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
}
