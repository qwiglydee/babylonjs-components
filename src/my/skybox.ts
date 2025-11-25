import { type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BackgroundMaterial } from "@babylonjs/core/Materials/Background/backgroundMaterial";
import { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Tags } from "@babylonjs/core/Misc/tags";
import { assertNonNull } from "@utils/asserts";

import { SceneElement } from "./base";

@customElement("my3d-skybox")
export class MyEnvironElem extends SceneElement {
    @property({ type: Number })
    intensity = 0.5;

    @property({ type: Number })
    blurring = 0.5;

    _texture!: BaseTexture;
    _material!: BackgroundMaterial;
    _mesh!: Mesh;

    override init(): void {
        assertNonNull(this.scene.environmentTexture, "Missing environment texture in scene")

        this._texture = this.scene.environmentTexture.clone()!;
        this._texture.coordinatesMode = Texture.SKYBOX_MODE;

        this._material = new BackgroundMaterial("(SkyBox)", this.scene);
        this._material.backFaceCulling = false;
        this._material.reflectionTexture = this._texture;

        this._mesh = CreateBox(this.localName, { size: this.babylon.worldSize, sideOrientation: Mesh.BACKSIDE }, this.scene);
        this._setId(this._mesh);
        this._setTags(this._mesh);
        Tags.AddTagsTo(this._mesh, "aux");
        this._mesh.isPickable = false;
        this._mesh.material = this._material;
        this._mesh.infiniteDistance = true;
        this._mesh.ignoreCameraMaxZ = true;
    }

    override dispose(): void {
        this._mesh.dispose(true, true);
    }

    override update(changes: PropertyValues) {
        if (changes.has("intensity") && this._texture) this._texture.level = this.intensity;
        if (changes.has("blurring") && this._material) this._material.reflectionBlur = this.blurring;
        super.update(changes);
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._mesh);
    }
}
