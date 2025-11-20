import { type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@babylonjs/core/Helpers/sceneHelpers";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { assertNonNull } from "@utils/asserts";

import { SceneElement } from "./elements";

@customElement("my3d-skyenv")
export class MyEnvironElem extends SceneElement {
    @property()
    src?: string;

    @property({ type: Number })
    intensity = 0.5;

    override init() {
        assertNonNull(this.src, `${this.tagName}.src is required`)
        this.scene.environmentTexture = new CubeTexture(this.src!, this.scene, {
            // I dunno what does all this mean
            noMipmap: false,
            prefiltered: true,
            createPolynomials: true,
        });
    }

    override dispose(): void {
        this.scene.environmentTexture?.dispose();
    }

    override update(changes: PropertyValues) {
        if (this.hasUpdated && changes.has("src")) throw Error("not supported");
        if (changes.has("intensity") && this.scene.environmentTexture) this.scene.environmentTexture.level = this.intensity;
        super.update(changes);
    }
}
