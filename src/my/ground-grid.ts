import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Tags } from "@babylonjs/core/Misc/tags";
import type { Nullable } from "@babylonjs/core/types";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import { assertNonNull } from "@utils/asserts";

import { SceneElement } from "./base";
import { boundsCtx, BoundsInfo } from "./context";


@customElement("my3d-ground-grid")
export class MyGridGroundElem extends SceneElement {
    @consume({ context: boundsCtx, subscribe: true })
    @state()
    bounds: Nullable<BoundsInfo> = null;

    @property()
    src: Nullable<string> = null;

    @property({ type: Number })
    size!: number;

    @property({ type: Number })
    scale = 1;

    @property({ type: Boolean })
    autoSize = false;

    @property()
    color: string = "#000000";

    @property({ type: Number })
    opacity = 0.5;

    @property({ type: Number })
    opacity2 = 0.25;

    _mesh!: Mesh;
    _material!: GridMaterial;

    override init() {
        assertNonNull(this.src, `${this.tagName}.src is required`)
        // debug(this, "initilizing");
        this._material = new GridMaterial("(Ground)", this.scene);
        this._material.majorUnitFrequency = 8;
        this._material.backFaceCulling = false;
        this._material.opacityTexture = new Texture(this.src, this.scene);

        this._mesh = CreateGround(this.localName, { width: 1.0, height: 1.0, subdivisions: 1 }, this.scene);
        this._setId(this._mesh);
        this._setTags(this._mesh);
        Tags.AddTagsTo(this._mesh, "aux");
        this._mesh.isPickable = false;
        this._mesh.material = this._material;

        this.size ??= 0.5 * this.babylon.worldSize;
    }

    override dispose(): void {
        this._mesh.dispose(true, true);    
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._mesh);
    }

    #resize() {
        // debug(this, "resizing", { size: this._size });
        this._mesh.scaling.x = this.size;
        this._mesh.scaling.z = this.size;
        this._material.gridRatio = this.scale / this.size;
    }

    override update(changes: PropertyValues) {
        if (changes.has("bounds") && this.autoSize && this.bounds) this.size = 2 * this.bounds!.world.boundingSphere.radiusWorld;
        if (changes.has("size") || changes.has("scale")) this.#resize();
        if (changes.has("opacity")) this._material.opacity = this.opacity;
        if (changes.has("opacity2")) this._material.minorUnitVisibility = this.opacity2;
        if (changes.has("color")) this._material.lineColor = Color3.FromHexString(this.color);
        super.update(changes);
    }
}
