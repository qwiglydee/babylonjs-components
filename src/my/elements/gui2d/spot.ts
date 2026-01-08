import type { PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";

import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { formatCSSColor, parseCSSColor } from "@utils/colors";

import { MyDot } from "@lib/gui2/dot";
import { GUI2ComponentBase } from "../../base/gui2";


@customElement("my2g-spot")
export class MyGUI2SpotElem extends GUI2ComponentBase {
    _spot!: MyDot;

    override init(): void {
        this._spot = new MyDot("dot");
        this.applyStyle(this._spot);

        // FIXME
        const gradient = new RadialGradient(0, 0, 0, 0, 0, this._spot.radius);
        const color = parseCSSColor(this._spot.color);
        gradient.addColorStop(0.0, formatCSSColor({ ...color, a: 1.0 }));
        gradient.addColorStop(1.0, formatCSSColor({ ...color, a: 0.0 }));
        this._spot.gradient = gradient;

        this.addControl(this._spot);
    }

    override dispose(): void {
        this._spot.dispose();
    }

    override update(changes: PropertyValues) {
        if (changes.has("enabled")) this._syncEnabled(this.enabled, this._spot);
        if (changes.has("visible")) this._syncVisible(this.visible, this._spot);
    }
}
