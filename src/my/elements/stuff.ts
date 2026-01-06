import { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3, Vector3 } from "@babylonjs/core/Maths";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Tools } from "@babylonjs/core/Misc/tools";
import { Nullable } from "@babylonjs/core/types";
import { assertNonNull } from "@utils/asserts";

import { SceneNodeElemBase } from "../base/node";
import { Coords, coordsConverter } from "../properties/coords";

@customElement("my3d-stuff")
export class MyStuffElem extends SceneNodeElemBase<Mesh> {
    @property({ useDefault: true, converter: coordsConverter })
    position: Coords = { x: 0, y: 0.5, z: 0 };

    @property()
    shape?: string;

    @property({ type: Number })
    size = 1;

    @property()
    texture: Nullable<string> = null;

    @property()
    color = "#808080";

    @property({type: Number })
    positionRnd = 0;

    _getMatrial() {
        const name = this.texture ? Tools.GetFilename(this.texture) : "stuff.mat";
        let mat = this.scene.getMaterialByName(name) as PBRMaterial;
        if (!mat) {
            mat = new PBRMaterial(name, this.scene);
            if (this.texture) {
                mat.albedoTexture = new Texture(this.texture, this.scene, { invertY: false });
            } else { 
                mat.albedoColor = Color3.FromHexString(this.color);
            }
            mat.roughness = 0.5;
        }
        return mat;
    }

    _createMesh(shape: string): Mesh {
        switch (shape) {
            case 'cube':
                return MeshBuilder.CreateBox(shape, { size: this.size }, this.scene);
            case 'sphere':
                return MeshBuilder.CreateSphere(shape, { diameter: this.size }, this.scene);
            case 'cone':
                return MeshBuilder.CreateCylinder(shape, { height: this.size, diameterBottom: this.size, diameterTop: 0 }, this.scene);
            case 'icosphere':
                return MeshBuilder.CreateIcoSphere(shape, { radius: 0.5 * this.size, subdivisions: 1 }, this.scene);
            default:
                throw Error(`Invalid shape: ${this.shape}`);
        }
    }

    override init() {
        assertNonNull(this.shape, `${this.tagName}.shape is required`);
        let name = this.shape;
        this._node = this._createMesh(this.shape);
        this._node.material = this._getMatrial();

        this._node.position = coordsConverter.toVector3(this.position)!
        
        if (this.positionRnd) {
            const rnd = Vector3.Random(-this.positionRnd, this.positionRnd);
            rnd.y = 0;
            this._node.position.addInPlace(rnd);
        }

        if (!this.id) {
            const i = this.babylon.scene.meshes.length + 1;
            this.id = `stuff.${i}`;   
        }
        super.init();
    }

    override update(changes: PropertyValues) {
        if (changes.has("position")) this._syncPosition(this.position);
        super.update(changes);
    }

    _syncPosition(position: Coords) {
        assertNonNull(this._node);
        assertNonNull(position);
        this._node.position = coordsConverter.toVector3(position)!;
    }
}
