import type { PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";

import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { COLORSTYLES } from "@lib/gui2/css";

import { GUI2ComponentBase } from "../../base/gui2";

@customElement("my2g-something")
export class MyGUISomethingElem extends GUI2ComponentBase {
    _rect!: Rectangle;
    _text!: TextBlock;

    override init(): void {
        this._rect = new Rectangle("rect");
        this._text = new TextBlock("text", this.textContent.trim());
        this._text.resizeToFit = true;

        this.applyStyle(this._rect);
        this.applyStyle(this._text, COLORSTYLES);
        this.applyStyle(this._text, ["padding"]);

        this._rect.addControl(this._text);
        this.addControl(this._rect);
    }

    override dispose(): void {
        this._rect.dispose();
        this._text.dispose();
    }

    override update(changes: PropertyValues) {
        if (changes.has("enabled")) this._syncEnabled(this.enabled, this._rect);
        if (changes.has("visible")) this._syncVisible(this.visible, this._rect);
    }
}
