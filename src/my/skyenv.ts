import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@babylonjs/core/Helpers/sceneHelpers";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import type { Scene } from "@babylonjs/core/scene";
import { assertNonNull } from "@utils/asserts";
import { debug } from "@utils/debug";
import { VirtualElement } from "@utils/element";

import { sceneCtx } from "./context";

@customElement("my3d-skyenv")
export class MyEnvironElem extends VirtualElement {
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    @property()
    src?: string;

    @property({ type: Number })
    intensity = 0.5;

    override connectedCallback(): void {
        assertNonNull(this.src, `${this.tagName}.src is required`)
        super.connectedCallback();
        this.#init();
    }

    #init() {
        this.scene.environmentTexture = new CubeTexture(this.src!, this.scene, {
            // I dunno what does all this mean
            noMipmap: false,
            prefiltered: true,
            createPolynomials: true,
        });
    }

    override update(changes: PropertyValues) {
        if (this.hasUpdated && changes.has("src")) throw Error("not supported");
        if (changes.has("intensity") && this.scene.environmentTexture) this.scene.environmentTexture.level = this.intensity;
        super.update(changes);
    }
}
