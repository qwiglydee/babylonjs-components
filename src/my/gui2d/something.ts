import { customElement } from "lit/decorators.js";

import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { debug } from "@utils/debug";
import { GUI2Element } from "./base";

@customElement("my2g-something")
export class MyGUISomethingElem extends GUI2Element {
    _control!: Rectangle;

    override init(): void {
        debug(this, "initializing");
        this._control = new Rectangle(this.localName);
        this._control.widthInPixels = 64;
        this._control.heightInPixels = 64;
        this._control.background = "#800080";
        
        this._applyStyle(this._control);
        this._addControl(this._control);
    }

    override dispose(): void {
        this._control.dispose()
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._control);
    }

    override toggleVisible(enabled: boolean): void {
        this._syncVisible(enabled, this._control);
    }
}
