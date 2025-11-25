import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { BackgroundMaterial } from "@babylonjs/core/Materials/Background/backgroundMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Tags } from "@babylonjs/core/Misc/tags";
import type { Nullable } from "@babylonjs/core/types";
import { assertNonNull } from "@utils/asserts";

import { SceneElement } from "./base";
import { boundsCtx, BoundsInfo } from "./context";


@customElement("my3d-ground-flat")
export class MyFlatGroundElem extends SceneElement {
    @consume({ context: boundsCtx, subscribe: true })
    @state()
    bounds: Nullable<BoundsInfo> = null;

    @property()
    src: Nullable<string> = null;

    @property({ type: Number })
    size!: number;

    @property({ type: Boolean })
    autoSize = false;

    @property()
    color: string = "#808080";

    @property({ type: Number })
    opacity = 1.0;

    _mesh!: Mesh;
    _material!: BackgroundMaterial;

    override init() {
        assertNonNull(this.src, `${this.tagName}.src is required`)
        // debug(this, "initilizing");
        this._material = new BackgroundMaterial("(ground)", this.scene);

        this._material.useRGBColor = false;
        this._material.backFaceCulling = true;
        this._material.diffuseTexture = new Texture(this.src, this.scene);
        this._material.diffuseTexture.hasAlpha = true;

        this._mesh = CreateGround(this.localName, { width: 1.0, height: 1.0, subdivisions: 1 }, this.scene);
        this._setId(this._mesh);
        this._setTags(this._mesh);
        Tags.AddTagsTo(this._mesh, "aux");
        this._mesh.isPickable = false;
        this._mesh.material = this._material;

        this.size ??= 0.5 * this.babylon.worldSize;
    }

    override dispose() {
        this._mesh.dispose(true, true);
    }

    #resize() {
        // debug(this, "resizing", { size: this._size });
        this._mesh.scaling.x = this.size;
        this._mesh.scaling.z = this.size;
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(this._mesh, enabled);
    }

    override update(changes: PropertyValues) {
        if (changes.has("bounds") && this.autoSize && this.bounds) this.size = 2 * this.bounds!.world.boundingSphere.radiusWorld;
        if (changes.has("size")) this.#resize();
        if (changes.has("opacity")) this._material.alpha = this.opacity;
        if (changes.has("color")) this._material.primaryColor = Color3.FromHexString(this.color);
        super.update(changes);
    }
}
