import { customElement, property } from "lit/decorators.js";

import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { assertNonNull } from "@utils/asserts";

import { ComponentElemBase } from "../base/elem";

@customElement("my3d-sky-env")
export class SkyenvElem extends ComponentElemBase {
    @property()
    src?: string;

    @property({ type: Number })
    intensity = 1.0;

    _texture?: CubeTexture;

    override init() {
        assertNonNull(this.src, `${this.localName}.src is required`);
        this._texture = new CubeTexture(this.src, this.scene, {
            // I dunno what does all this mean
            noMipmap: false,
            prefiltered: true,
            createPolynomials: true,
        });
        this._texture.level = this.intensity;
        this.scene.environmentTexture = this._texture;
    }

    override dispose() {
        this._texture!.dispose();
    }
}
