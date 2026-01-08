import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { COLORSTYLES, TEXTSTYLES } from "@lib/gui2/css";
import { MyLabel } from "@lib/gui2/label";

import { GUI2ComponentBase } from "../../base/gui2";

@customElement("my2g-label")
export class MyGUILabelElem extends GUI2ComponentBase {
    @property()
    anchor = "";

    _label!: MyLabel;

    override init(): void {
        this._label = new MyLabel("label", this.textContent.trim());
        this.addControl(this._label);

        this.applyStyle(this._label);
        this.applyStyle(this._label, ['offset']);
        this.applyStyle(this._label._textBlock!, TEXTSTYLES);
        this.applyStyle(this._label._textBlock!, COLORSTYLES);

        // FIXME: make controller
        this.main.scene.onNewMeshAddedObservable.add(this.#onupdate);
        this.main.scene.onMeshRemovedObservable.add(this.#onupdate);
    }

    override dispose(): void {
        this._label.dispose()
    }

    override update(changes: PropertyValues) {
        if (changes.has('anchor')) this.#rettach();
        if (changes.has("enabled")) this._syncEnabled(this.enabled, this._label);
        if (changes.has("visible")) this._syncVisible(this.visible, this._label);
        super.update(changes);
    }

    #onupdate = () => {
        this.#rettach();
    }

    #rettach() {
        const target = this.main.querySelectorNode(this.anchor);
        if (target instanceof TransformNode) {
            this._syncVisible(true);
            this._label.anchor.target = target;
        } else {
            this._syncVisible(false);
            this._label.anchor.unlink();
        }
    }
}
