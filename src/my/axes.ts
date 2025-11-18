import { consume } from "@lit/context";
import { ReactiveElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";
import type { Scene } from "@babylonjs/core/scene";

import { sceneCtx } from "./context";
import { VirtualElement } from "@utils/element";
import { assertNonNull } from "@utils/asserts";

@customElement("my3d-axes")
export class MyAxesElem extends VirtualElement {
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    @property({ type: Number })
    scale = 1;

    @property({ type: Number })
    thickness = 1;

    override connectedCallback(): void {
        super.connectedCallback();
        this.#init();
    }

    #init() {
        assertNonNull(this.scene);
        new AxesViewer(this.scene, this.scale, undefined, undefined, undefined, undefined, this.thickness);
    }

}
