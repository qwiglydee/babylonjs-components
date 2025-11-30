import { customElement, property } from "lit/decorators.js";

import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { GUI2Element } from "./base";
import { PropertyValues } from "lit";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";

@customElement("my2g-label")
export class MyGUILabelElem extends GUI2Element {
    @property()
    anchor = "";

    _rect!: Rectangle;
    _text!: TextBlock;

    override init(): void {
        this._rect = new Rectangle("rect");
        this._text = new TextBlock("text", this.textContent.trim());
        this._rect.addControl(this._text);
        this._addControl(this._rect);

        this._applyStyle(this._rect);
        this._applyStyle(this._text);
        this._rect.adaptWidthToChildren = true;
        this._rect.adaptHeightToChildren = true;
        this._text.resizeToFit = true;
        this._text.textWrapping = false;
        this._text.alpha = 1.0;

        this.babylon.onUpdatedObservable.add(() => this.requestUpdate('anchor'));
    }

    override dispose(): void {
        this._rect.dispose()
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._rect);
    }

    override toggleVisible(enabled: boolean): void {
        const actually = enabled && this._rect.linkedMesh != null && this._rect.linkedMesh.isEnabled(false);
        this._syncVisible(actually, this._rect);
    }

    #rettach() {
        const match = this.babylon.querySelectorNode(this.anchor) as TransformNode;
        this._rect.linkWithMesh(match);
        this.toggleVisible(match != null);
    }

    override update(changes: PropertyValues): void {
        if (changes.has("anchor")) this.#rettach();
        super.update(changes);
    }
}
