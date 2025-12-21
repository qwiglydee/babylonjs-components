import { customElement, property } from "lit/decorators.js";

import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
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
        this._applyStyle(this._label._textBlock!, TEXTSTYLES);
        this._applyStyle(this._label._textBlock!, COLORSTYLES);

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
        this.toggleVisible(target != null);
        if (target instanceof AbstractMesh) {
            this._label.anchor.linkMesh(target);
        } else if (target instanceof TransformNode) {
            this._label.anchor.linkNode(target);
        } else {
            this._label.anchor.unlink();
        }
    }
    
    override update(changes: PropertyValues): void {
        if (changes.has("anchor")) this.#rettach();
        super.update(changes);
    }
}
