import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { MyCalloutLabel, MyCalloutLine } from "@lib/gui2/callout";
import { COLORSTYLES, DRAWSTYLES, TEXTSTYLES } from "@lib/gui2/css";
import { querySelectorNode } from "@lib/queryselecting";
import { formatCSSColor, parseCSSColor } from "@utils/colors";

import { GUI2ComponentBase } from "../../base/gui2";

@customElement("my2g-callout")
export class MyGUICalloutElem extends GUI2ComponentBase {
    @property()
    anchor = "";

    @property({ type: Boolean })
    edge = false;

    _label!: MyCalloutLabel;
    _line!: MyCalloutLine;

    override init(): void {
        this._label = new MyCalloutLabel("label", this.textContent.trim());
        this._label.zIndex = 2;
        this._label.edge = this.edge;
        this.gui.addControl(this._label);
        this._line = new MyCalloutLine("line");
        this._label.zIndex = 1;
        this.gui.addControl(this._line);
        this._line.anchor2.target = this._label;

        this.applyStyle(this._label);
        this.applyStyle(this._label, ['offset']);
        this.applyStyle(this._label._textBlock!, TEXTSTYLES);
        this.applyStyle(this._label._textBlock!, COLORSTYLES);
        this.applyStyle(this._label._textBlock!, ['padding']);
        this.applyStyle(this._line, DRAWSTYLES);

        const gradient = new RadialGradient(0, 0, 0, 0, 0, 128);
        const color = parseCSSColor(this._line.color);
        gradient.addColorStop(0.0, formatCSSColor({...color, a: 0.0 }));
        gradient.addColorStop(1.0, formatCSSColor({...color, a: 1.0 }));
        this._line.gradient = gradient;
        
        // FIXME: make controller
        this.main.scene.onNewMeshAddedObservable.add(this.#onupdate);
        this.main.scene.onMeshRemovedObservable.add(this.#onupdate);
    }

    override dispose(): void {
        this._label.dispose()
    }

    override update(changes: PropertyValues) {
        if (changes.has("edge")) this._label.edge = this.edge;
        if (changes.has('anchor')) this.#rettach();
        if (changes.has("enabled")) this._syncEnabled(this.enabled, this._label);
        if (changes.has("visible")) this._syncVisible(this.visible, this._label);
        super.update(changes);
    }

    #onupdate = () => {
        this.#rettach();
    }

    #rettach() {
        const target = querySelectorNode(this.main.scene, this.anchor);
        if (target instanceof TransformNode) {
            this.visible = true;
            this._label.anchor.target = target;
            this._line.anchor1.target = target;
        } else {
            this.visible = false;
            this._label.anchor.unlink();
            this._line.anchor1.unlink();
        }
    }
}
