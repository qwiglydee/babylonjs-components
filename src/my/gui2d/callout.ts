import { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MyCalloutLine } from "@lib/gui2callout";
import { MyEdgeLabel, MyLabel } from "@lib/gui2label";
import { GUI2Element } from "./base";
import { COLORSTYLES, DRAWSTYLES, TEXTSTYLES } from "./css";
import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { formatCSSColor, parseCSSColor } from "@utils/colors";

@customElement("my2g-callout")
export class MyGUICallout extends GUI2Element {
    @property()
    anchor = "";

    _label!: MyLabel;
    _line!: MyCalloutLine;

    override init(): void {
        this._label = new MyEdgeLabel("label", this.textContent.trim());
        this._label.zIndex = 1;
        this._line = new MyCalloutLine("line");
        this._addControl(this._label);
        this._addControl(this._line);
        this._line.linkWithControl(this._label);

        this._applyStyle(this._label);
        this._applyStyle(this._label.textBlock!, TEXTSTYLES);
        this._applyStyle(this._label.textBlock!, COLORSTYLES);
        this._applyStyle(this._label.textBlock!, ['padding']);
        this._applyStyle(this._line, DRAWSTYLES);

        const gradient = new RadialGradient(0, 0, 0, 0, 0, 128);
        const c = parseCSSColor(this._line.color);
        c.a = 0;
        gradient.addColorStop(0, formatCSSColor(c));
        gradient.addColorStop(1, this._line.color);
        this._line.gradient = gradient;

        this.babylon.onUpdatedObservable.add(() => this.requestUpdate('anchor'));
    }

    override dispose(): void {
        this._label.dispose()
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._label, this._line);
    }

    override toggleVisible(enabled: boolean): void {
        const actually = enabled && this._label.linkedMesh != null && this._label.linkedMesh.isEnabled(false);
        this._syncVisible(actually, this._label, this._line);
    }

    #rettach() {
        const match = this.babylon.querySelectorNode(this.anchor) as TransformNode;
        this._label.linkWithMesh(match);
        this._line.linkWithMesh(match);
        this.toggleVisible(match != null);
    }

    override update(changes: PropertyValues): void {
        if (changes.has("anchor")) this.#rettach();
        super.update(changes);
    }
}
