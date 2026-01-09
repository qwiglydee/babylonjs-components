import { customElement } from "lit/decorators.js";

import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { formatCSSColor, parseCSSColor } from "@utils/colors";

import { MyDot } from "@lib/gui2/dot";
import { GUI2ComponentBase } from "../../base/gui2";


@customElement("my2g-spot")
export class MyGUI2SpotElem extends GUI2ComponentBase {
    override init(): void {
        const spot = new MyDot("dot");
        this.applyStyle(spot);

        const gradient = new RadialGradient(0, 0, 0, 0, 0, spot.radius);
        const color = parseCSSColor(spot.color);
        gradient.addColorStop(0.0, formatCSSColor({ ...color, a: 1.0 }));
        gradient.addColorStop(1.0, formatCSSColor({ ...color, a: 0.0 }));
        spot.gradient = gradient;

        this.addControl(spot);
    }
}
