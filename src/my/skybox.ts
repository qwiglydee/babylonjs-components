import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BackgroundMaterial } from "@babylonjs/core/Materials/Background/backgroundMaterial";
import { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Tags } from "@babylonjs/core/Misc/tags";
import type { Scene } from "@babylonjs/core/scene";
import { assertNonNull } from "@utils/asserts";
import { VirtualElement } from "@utils/element";

import { sceneCtx, sizeCtx } from "./context";

@customElement("my3d-skybox")
export class MyEnvironElem extends VirtualElement {
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    @consume({ context: sizeCtx })
    worldSize = 1;

    @property({ type: Number })
    intensity = 0.5;

    @property({ type: Number })
    blurring = 0.5;

    override connectedCallback(): void {
        super.connectedCallback();
        this.#init();
    }

    _skytxt!: BaseTexture;
    _skymat!: BackgroundMaterial;
    _skymesh!: Mesh;

    #init() {
        assertNonNull(this.scene.environmentTexture, "Missing environment texture in scene")

        this._skytxt = this.scene.environmentTexture.clone()!;
        this._skytxt.coordinatesMode = Texture.SKYBOX_MODE;

        this._skymat = new BackgroundMaterial("(SkyBox)", this.scene);
        this._skymat.backFaceCulling = false;
        this._skymat.reflectionTexture = this._skytxt;

        this._skymesh = CreateBox("(SkyBox)", { size: this.worldSize, sideOrientation: Mesh.BACKSIDE }, this.scene);
        Tags.AddTagsTo(this._skymesh, "aux");
        this._skymesh.isPickable = false;
        this._skymesh.material = this._skymat;
        this._skymesh.infiniteDistance = true;
        this._skymesh.ignoreCameraMaxZ = true;
    }

    override update(changes: PropertyValues) {
        if (changes.has("intensity") && this._skytxt) this._skytxt.level = this.intensity;
        if (changes.has("blurring") && this._skymat) this._skymat.reflectionBlur = this.blurring;
        super.update(changes);
    }
}
