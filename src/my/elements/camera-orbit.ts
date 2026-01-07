import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { assertNonNull } from "@utils/asserts";

import { CameraElemBase } from "../base/camera";
import { type Coords, coordsConverter } from "../properties/coords";
import { type Polar, polarConverter } from "../properties/polar";

@customElement("my3d-camera-orbit")
export class OrbitCameraElem extends CameraElemBase<ArcRotateCamera> {
    /** one-way sync of target coords */
    @property({ useDefault: true, converter: coordsConverter })
    target: Coords = { x: 0, y: 0, z: 0 };

    /** two-way sync of orbit params */
    @property({ useDefault: true, converter: polarConverter })
    set orbit(value: Polar) {
        this.__orbit = value;
    }
    get orbit(): Polar {
        return this._camera ? polarConverter.fromCam(this._camera)! : this.__orbit;
    }
    @state()
    __orbit: Polar = { a: 0, b: 0, r: 1 };

    override init() {
        const params = polarConverter.toCam(this.orbit)!;
        const target = coordsConverter.toVector3(this.target)!;
        this._camera = new ArcRotateCamera("camera", params.alpha, params.beta, params.radius, target, this.scene);
        super.init();
    }

    override update(changes: PropertyValues) {
        if (changes.has("target")) this._syncTarget(this.target);
        if (changes.has("__orbit")) this._syncOrbit(this.__orbit);
        super.update(changes);
    }

    _syncTarget(coords: Coords) {
        assertNonNull(this._camera);
        assertNonNull(coords);
        this._camera.target = coordsConverter.toVector3(coords)!;
    }

    _syncOrbit(polar: Polar) {
        assertNonNull(this._camera);
        assertNonNull(polar);
        Object.assign(this._camera, polarConverter.toCam(polar)!);
    }
}
