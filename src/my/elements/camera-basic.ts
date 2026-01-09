import { type PropertyValues } from "lit-element";
import { customElement, property } from "lit-element/decorators.js";

import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { assertNonNull } from "@utils/asserts";

import { CameraElemBase } from "../base/camera";
import { type Coords, coordsConverter } from "../properties/coords";

@customElement("b3d-camera-basic")
export class BasicCameraElem extends CameraElemBase<UniversalCamera> {
    @property({ useDefault: true, converter: coordsConverter })
    position: Coords = { x: 0, y: 1.75, z: 0 };

    @property({ useDefault: true, converter: coordsConverter })
    target: Coords = { x: 0, y: 0, z: 0 };

    override init() {
        this._camera = new UniversalCamera("camera", coordsConverter.toVector3(this.position)!, this.scene);
        this._camera.target = coordsConverter.toVector3(this.target)!;

        this._camera.inputs.addMouseWheel();
        // @ts-ignore
        this._camera.inputs.attached["mousewheel"].wheelPrecisionY = 0.1;
        // @ts-ignore
        this._camera.inputs.attached["mousewheel"].wheelPrecisionX = 0.1;
        
        super.init();
    }

    override update(changes: PropertyValues) {
        if (changes.has("position")) this._syncPosition(this.position);
        if (changes.has("target")) this._syncTarget(this.target);
        super.update(changes);
    }

    _syncPosition(coords: Coords) {
        assertNonNull(this._camera);
        assertNonNull(coords);
        this._camera.position = coordsConverter.toVector3(coords)!;
    }

    _syncTarget(coords: Coords) {
        assertNonNull(this._camera);
        assertNonNull(coords);
        this._camera.target = coordsConverter.toVector3(coords)!;
    }
}
