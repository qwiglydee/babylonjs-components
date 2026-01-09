import { customElement } from "lit-element/decorators.js";

import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

import { GUI2ComponentBase } from "../../base/gui2";

@customElement("b2g-something")
export class MyGUISomethingElem extends GUI2ComponentBase {
    _text!: TextBlock;

    override init(): void {
        this._text = new TextBlock("text", this.textContent.trim());
        this._text.resizeToFit = true;

        this.applyStyle(this._text);

        this.addControl(this._text);
    }
}
