import { customElement } from "lit/decorators.js";

import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { COLORSTYLES } from "@lib/gui2/css";
import { debug } from "@utils/debug";

import { GUI2Element } from "./base";

@customElement("my2g-something")
export class MyGUISomethingElem extends GUI2Element {
    _rect!: Rectangle;
    _text!: TextBlock;

    override init(): void {
        debug(this, "initializing");
        this._rect = new Rectangle("rect");
        this._text = new TextBlock("text", this.textContent.trim());
        this._text.resizeToFit = true;
        this._rect.addControl(this._text);
        this._addControl(this._rect);

        this._applyStyle(this._rect);
        this._applyStyle(this._text, COLORSTYLES);
        this._applyStyle(this._text, ['padding']);
    }

    override dispose(): void {
        this._rect.dispose()
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._rect);
    }

    override toggleVisible(enabled: boolean): void {
        this._syncVisible(enabled, this._rect);
    }
}
