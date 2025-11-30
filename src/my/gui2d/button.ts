import { customElement } from "lit/decorators.js";

import { Button } from "@babylonjs/gui/2D/controls/button";
import { debug } from "@utils/debug";
import { GUI2Element } from "./base";
import { bubbleEvent } from "@utils/events";

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
        this._applyStyle(this._button.textBlock!);

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
