import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Tags } from "@babylonjs/core/Misc/tags";
import type { Nullable } from "@babylonjs/core/types";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import { assertNonNull } from "@utils/asserts";

import { sizeCtx } from "./context";
import { SceneElement } from "./elements";


@customElement("my3d-ground-grid")
export class MyGridGroundElem extends SceneElement {
    @consume({ context: sizeCtx })
    worldSize = 1;

    @property()
    src: Nullable<string> = null;

    @property({ type: Number })
    size!: number;

    @property({ type: Number })
    scale = 1;

    @property({ type: Boolean })
    autoSize = false;

    @property()
    color: string = "#33334D";

    @property({ type: Number })
    opacity = 0.5;

    @property({ type: Number })
    opacity2 = 0.25;

    _ground!: Mesh;
    _material!: GridMaterial;

    override init() {
        assertNonNull(this.src, `${this.tagName}.src is required`)
        // debug(this, "initilizing");
        this._material = new GridMaterial("(Ground)", this.scene);
        this._material.majorUnitFrequency = 8;
        this._material.backFaceCulling = false;
        this._material.opacityTexture = new Texture(this.src, this.scene);

        this._ground = CreateGround("(Ground)", { width: 1.0, height: 1.0, subdivisions: 1 }, this.scene);
        Tags.AddTagsTo(this._ground, "aux");
        this._ground.isPickable = false;
        this._ground.material = this._material;

        this.size ??= 0.5 * this.worldSize;
    }

    override dispose(): void {
        this._ground.dispose(true, true);    
    }

    // #calcSize() {
    //     return this.model.world ? 2 * (new Vector2(this.model.world.extendSize.x, this.model.world.extendSize.z)).length() : this.defaultSize;
    // }

    #resize() {
        // debug(this, "resizing", { size: this._size });
        this._ground.scaling.x = this.size;
        this._ground.scaling.z = this.size;
        this._material.gridRatio = this.scale / this.size;
    }

    override update(changes: PropertyValues) {
        // if (this.autoSize && (changes.has("model") || changes.has("autoSize"))) this._size = this.#calcSize();
        if (changes.has("size") || changes.has("scale")) this.#resize();
        if (changes.has("opacity")) this._material.opacity = this.opacity;
        if (changes.has("opacity2")) this._material.minorUnitVisibility = this.opacity2;
        if (changes.has("color")) this._material.lineColor = Color3.FromHexString(this.color);
        super.update(changes);
    }
}
