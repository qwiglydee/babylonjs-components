import { customElement, property } from "lit/decorators.js";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MyLabel } from "@lib/gui2label";
import { PropertyValues } from "lit";
import { GUI2Element } from "./base";
import { COLORSTYLES, TEXTSTYLES } from "./css";

@customElement("my2g-label")
export class MyGUILabelElem extends GUI2Element {
    @property()
    anchor = "";

    _label!: MyLabel;

    override init(): void {
        this._label = new MyLabel("label", this.textContent.trim());
        this._addControl(this._label);

        this._applyStyle(this._label);
        this._applyStyle(this._label.textBlock!, TEXTSTYLES);
        this._applyStyle(this._label.textBlock!, COLORSTYLES);
        this._applyStyle(this._label.textBlock!, ['padding']);

        this.babylon.onUpdatedObservable.add(() => this.requestUpdate('anchor'));
    }

    override dispose(): void {
        this._label.dispose()
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._label);
    }

    override toggleVisible(enabled: boolean): void {
        const actually = enabled && this._label.linkedMesh != null && this._label.linkedMesh.isEnabled(false);
        this._syncVisible(actually, this._label);
    }

    #rettach() {
        const match = this.babylon.querySelectorNode(this.anchor) as TransformNode;
        this._label.linkWithMesh(match);
        this.toggleVisible(match != null);
    }

    override update(changes: PropertyValues): void {
        if (changes.has("anchor")) this.#rettach();
        super.update(changes);
    }
}
