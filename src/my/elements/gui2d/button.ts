import { customElement } from "lit/decorators.js";

import { Button } from "@babylonjs/gui/2D/controls/button";
import { ALLSTYLES, POSITIONSTYLES } from "@lib/gui2/css";
import { bubbleEvent } from "@utils/events";

import { GUI2ComponentBase } from "../../base/gui2";

@customElement("my2g-button")
export class MyGUIButtonElem extends GUI2ComponentBase {
    override init(): void {
        const button = Button.CreateSimpleButton("button", this.textContent.trim());
        button.textBlock!.name = "label";
        button.textBlock!.resizeToFit = true;
        button.textBlock!.textWrapping = false;

        this.applyStyle(button);
        this.applyStyle(button.textBlock!, ALLSTYLES.difference(POSITIONSTYLES));
        this.applyStyle(button.textBlock!, ['padding']);

        this.addControl(button);
        button.onPointerClickObservable.add(info => bubbleEvent(this, 'click', info));
    }
}
