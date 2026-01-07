import { customElement } from "lit/decorators.js";

import { Button } from "@babylonjs/gui/2D/controls/button";
import { ALLSTYLES, POSITIONSTYLES } from "@lib/gui2/css";
import { debug } from "@utils/debug";
import { bubbleEvent } from "@utils/events";

import { GUI2Element } from "./base";

@customElement("my2g-button")
export class MyGUIButtonElem extends GUI2Element {
    _button!: Button;

    #observer: any;

    override init(): void {
        debug(this, "initializing");
        this._button = Button.CreateSimpleButton("button", this.textContent.trim());
        this._button.textBlock!.name = "label";
        this._button.textBlock!.resizeToFit = true;
        this._button.textBlock!.textWrapping = false;
        this._addControl(this._button);

        this._applyStyle(this._button);
        this._applyStyle(this._button.textBlock!, ALLSTYLES.difference(POSITIONSTYLES));
        this._applyStyle(this._button.textBlock!, ['padding']);

        this.#observer = this._button.onPointerClickObservable.add(this.#onclick);
    }

    override dispose(): void {
        this.#observer?.remove();
        this._button.dispose();
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._button);
    }

    override toggleVisible(enabled: boolean): void {
        this._syncVisible(enabled, this._button);
    }

    #onclick = (info: any) => {
        bubbleEvent(this, 'click', info);
    }
}
