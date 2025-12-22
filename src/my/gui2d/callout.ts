import { customElement, property } from "lit/decorators.js";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";

import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { MyCalloutLabel, MyCalloutLine } from "@lib/gui2callout";
import { formatCSSColor, parseCSSColor } from "@utils/colors";
import { PropertyValues } from "lit";
import { GUI2Element } from "./base";
import { COLORSTYLES, DRAWSTYLES, TEXTSTYLES } from "./css";

@customElement("my2g-callout")
export class MyGUICalloutElem extends GUI2Element {
    @property()
    anchor = "";

    @property({ type: Boolean })
    edge = false;

    _label!: MyCalloutLabel;
    _line!: MyCalloutLine;

    override init(): void {
        this._label = new MyCalloutLabel("label", this.textContent.trim());
        this._label.zIndex = 2;
        this.gui.addControl(this._label);
        this._line = new MyCalloutLine("line");
        this._label.zIndex = 1;
        this.gui.addControl(this._line);
        this._line.anchor2.target = this._label;

        this._applyStyle(this._label);
        this._applyStyle(this._label, ['offset']);
        this._applyStyle(this._label._textBlock!, TEXTSTYLES);
        this._applyStyle(this._label._textBlock!, COLORSTYLES);
        this._applyStyle(this._label._textBlock!, ['padding']);
        this._applyStyle(this._line, DRAWSTYLES);

        this._line.gradient = new RadialGradient(0, 0, 0, 0, 0, 128);
        const color = parseCSSColor(this._line.color);
        this._line.gradient.addColorStop(0.0, formatCSSColor({...color, a: 0.0 }));
        this._line.gradient.addColorStop(1.0, formatCSSColor({...color, a: 1.0 }));

        this.babylon.onUpdatedObservable.add(() => this.requestUpdate('anchor'));
    }

    override dispose(): void {
        this._label.dispose()
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._label);
    }

    override toggleVisible(enabled: boolean): void {
        this._syncVisible(enabled, this._label);
    }

    #rettach() {
        const target = this.babylon.querySelectorNode(this.anchor);
        if (target instanceof TransformNode) {
            this.toggleVisible(true);
            this._label.anchor.target = target;
            this._line.anchor1.target = target;
        } else {
            this.toggleVisible(false);
            this._label.anchor.unlink();
            this._line.anchor1.unlink();
        }
    }

    override update(changes: PropertyValues): void {
        if (changes.has("edge")) this._label.edge = this.edge;
        if (changes.has("anchor")) this.#rettach();
        super.update(changes);
    }
}
