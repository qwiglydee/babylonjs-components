import type { PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";

import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

import { GUI2ComponentBase } from "../../base/gui2";

@customElement("my2g-something")
export class MyGUISomethingElem extends GUI2ComponentBase {
    _text!: TextBlock;

    override init(): void {
        this._text = new TextBlock("text", this.textContent.trim());
        this._text.resizeToFit = true;

        this.applyStyle(this._text);

        this.addControl(this._text);
    }

    override dispose(): void {
        this._text.dispose();
    }

    override update(changes: PropertyValues) {
        if (changes.has("enabled")) this._syncEnabled(this.enabled, this._text);
        if (changes.has("visible")) this._syncVisible(this.visible, this._text);
    }
}
