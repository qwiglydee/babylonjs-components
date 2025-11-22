import { customElement, property, state } from "lit/decorators.js";

import { Vector3 } from "@babylonjs/core/Maths";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { dbgChanges, debug } from "@utils/debug";

import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { assertNonNull } from "@utils/asserts";
import { PropertyValues } from "lit";
import { SceneElement } from "./base";

@customElement("my3d-stuff")
export class MyStuffElem extends SceneElement {
    @property()
    shape?: string;

    @property({ type: Number })
    size = 1;

    @property()
    texture = "assets/checker.png";

    @property({ type: Number })
    randomizePos = 0;

    @property({ type: Boolean, reflect: true })
    override hidden = false;

    @state()
    _position = Vector3.Zero();

    set position(coords: {x?: number, y?: number, z?: number}) {
        // NB: could be set before init
        this._position = new Vector3(
            coords.x ?? this._position.x,
            coords.y ?? this._position.y,
            coords.z ?? this._position.z
        );
    }

    _mesh!: Mesh;

    _getMatrial() {
        let mat = this.scene.getMaterialByName("test") as PBRMaterial;
        if (!mat) {
            mat = new PBRMaterial("test", this.scene);
            mat.albedoTexture = new Texture(this.texture, this.scene, { invertY: false });
            mat.roughness = 0.5;
        }
        return mat;
    }

    _rndPosition(radius: number) {
        const rndc = () => Math.floor((Math.random() * 2 - 1) * radius);
        return new Vector3(rndc(), 0, rndc());
    }

    override init() {
        assertNonNull(this.shape, `Missing ${this.tagName}.shape`);

        if (!this.id) {
            let idx = (1 + (this.scene.meshes.length ?? 0)).toString().padStart(3, "0");
            this.id = `${this.shape}.${idx}`;
        }
        debug(this, "creating", {shape: this.shape, rnd: this.randomizePos });

        switch (this.shape) {
            case 'cube':
                this._mesh = MeshBuilder.CreateBox(this.shape, { size: this.size }, this.scene);
                break;
            case 'sphere':
                this._mesh = MeshBuilder.CreateSphere(this.shape, { diameter: this.size }, this.scene);
                break;
            case 'cone':
                this._mesh = MeshBuilder.CreateCylinder(this.shape, { height: this.size, diameterBottom: this.size, diameterTop: 0 }, this.scene);
                break;
            case 'icosphere':
                this._mesh = MeshBuilder.CreateIcoSphere(this.shape, { radius: 0.5 * this.size, subdivisions: 1 }, this.scene);
                break;
            default:
                throw Error(`Invalid shape: ${this.shape}`);
        }
        this._mesh.id = this.id;
        this._mesh.material = this._getMatrial();

        if (this.randomizePos) this._position = this._rndPosition(this.randomizePos);
        this._position.y = 0.5 * this.size;
    };

    override dispose() {
        this._mesh.dispose(true, false);
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(this._mesh, enabled);
    }

    override update(changes: PropertyValues): void {
        if (changes.has('_position')) this._mesh.position = this._position;
        if (changes.has('hidden')) this._mesh.visibility = this.hidden ? 0 : 1;
        super.update(changes);
    }
}
