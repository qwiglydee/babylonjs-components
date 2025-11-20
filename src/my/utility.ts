import { consume, provide } from "@lit/context";
import { customElement, property } from "lit/decorators.js";

import { UtilityLayerRenderer } from "@babylonjs/core/Rendering/utilityLayerRenderer";
import type { Scene } from "@babylonjs/core/scene";
import { VirtualElement } from "@utils/element";

import { sceneCtx } from "./context";

@customElement("my3d-utility")
export class MyUtilityElem extends VirtualElement {
    @consume({ context: sceneCtx, subscribe: false })
    origScene!: Scene;

    @provide({ context: sceneCtx })
    utilScene!: Scene;

    layer!: UtilityLayerRenderer;

    @property({ type: Boolean})
    events = false;

    override connectedCallback(): void {
        super.connectedCallback();
        this.layer = new UtilityLayerRenderer(this.origScene, this.events, false);
        this.utilScene = this.layer.utilityLayerScene;
    }

    override disconnectedCallback(): void {
        this.layer.dispose();
        super.disconnectedCallback();
    }
}
