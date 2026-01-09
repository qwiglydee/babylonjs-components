import { type PropertyValues } from "lit-element";
import { customElement, property, state } from "lit-element/decorators.js";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { assertNonNull } from "@utils/asserts";

import { NodeElemBase } from "../base/node";
import { coordsConverter, type Coords } from "../properties/coords";

/**
 * A bare transform node with configurable position
 */
@customElement("b3d-anchor")
export class MyAnchorElem extends NodeElemBase<TransformNode> {
    /** 
     * Absolute position
     * read/write property 
     */
    @property({ useDefault: true, converter: coordsConverter })
    set position(value: Coords) {
        this.__position = value;
    }
    get position(): Coords {
        return this._node ? coordsConverter.fromVector3(this._node.getAbsolutePosition()) : this.__position;
    }
    @state()
    __position: Coords = { x: 0, y: 0, z: 0 };

    override init() {
        this._node = new TransformNode("anchor");
        this._syncPosition(this.__position);
        super.init();
    }

    override update(changes: PropertyValues): void {
        if (changes.has("__position")) this._syncPosition(this.__position);
        super.update(changes);
    }

    _syncPosition(position: Coords) {
        assertNonNull(this._node);
        assertNonNull(position);
        this._node.setAbsolutePosition(coordsConverter.toVector3(position));
    }
}
