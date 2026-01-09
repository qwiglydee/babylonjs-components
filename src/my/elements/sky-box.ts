import { customElement, property } from "lit-element/decorators.js";

import { BackgroundMaterial } from "@babylonjs/core/Materials/Background/backgroundMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { assertNonNull } from "@utils/asserts";

import { NodeElemBase } from "../base/node";

@customElement("my3d-sky-box")
export class SkyboxElem extends NodeElemBase<Mesh> {
    static override auxiliary = true;

    @property({ type: Number })
    intensity = 1.0;

    @property({ type: Number })
    blurring = 0.5;

    override init(): void {
        assertNonNull(this.scene.environmentTexture, "Missing environment texture in scene");

        const texture = this.scene.environmentTexture.clone()!;
        texture.coordinatesMode = Texture.SKYBOX_MODE;
        texture.level = this.intensity;

        const material = new BackgroundMaterial("skybox.mat", this.scene);
        material.backFaceCulling = false;
        material.reflectionTexture = texture;
        material.reflectionBlur = this.blurring;

        this._node = CreateBox("skybox", { size: this.main.worldSize, sideOrientation: Mesh.BACKSIDE }, this.scene);
        this._node.isPickable = false;
        this._node.infiniteDistance = true;
        this._node.ignoreCameraMaxZ = true;
        this._node.material = material;
        
        super.init();
    }

    override dispose(): void {
        this._node?.dispose(false, true);
    }
}
