import { customElement } from "lit/decorators.js";

import { Button } from "@babylonjs/gui/2D/controls/button";
import { ALLSTYLES, POSITIONSTYLES } from "@lib/gui2/css";
import { bubbleEvent } from "@utils/events";

import { GUI2ComponentBase } from "../../base/gui2";
import type { PropertyValues } from "lit";

@customElement("my2g-button")
export class MyGUIButtonElem extends GUI2ComponentBase {
    _button!: Button;

    #observer: any;

    override init(): void {
        this._button = Button.CreateSimpleButton("button", this.textContent.trim());
        this._button.textBlock!.name = "label";
        this._button.textBlock!.resizeToFit = true;
        this._button.textBlock!.textWrapping = false;

        this.applyStyle(this._button);
        this.applyStyle(this._button.textBlock!, ALLSTYLES.difference(POSITIONSTYLES));
        this.applyStyle(this._button.textBlock!, ['padding']);

        this.addControl(this._button);
        this.#observer = this._button.onPointerClickObservable.add(info => bubbleEvent(this, 'click', info));
    }

    override dispose(): void {
        this.#observer?.remove();
        this._button.dispose();
    }

    override update(changes: PropertyValues) {
        if (changes.has("enabled")) this._syncEnabled(this.enabled, this._button);
        if (changes.has("visible")) this._syncVisible(this.visible, this._button);
        super.update(changes);
    }
}
