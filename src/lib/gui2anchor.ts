import { Vector3 } from "@babylonjs/core/Maths/math";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { assertNonNull } from "@utils/asserts";

/**
 * Universal link position tracker
 * Can be attached to anything
 * 
 * - auto updates own x y
 * - marks owner dirty if changed
 * - marks owner nonRenderable when target is OOB or disabled 
 *  
 */
export class Anchor {
    owner: Control;
    target: Nullable<TransformNode | AbstractMesh | Control> = null;

    x: number | null = null;
    y: number | null = null;

    get isLinked(): boolean { return this.target != null; } 

    get isActive(): boolean { return !this.owner.notRenderable; }

    get _host(): AdvancedDynamicTexture {
        return this.owner.host;
    }

    get _scene(): Scene {
        // NB: scene of gui != scene of target
        assertNonNull(this.owner.host, "control not added to gui");
        return this.owner.host.getScene() as Scene;
    }

    constructor(owner: Control) {
        this.owner = owner;
    }

    #observer: Nullable<Observer<any>> = null;

    linkNode(target: TransformNode) {
        this.target = target;
        this.#observer = this._scene.onBeforeCameraRenderObservable.add(this.#checkNode);
        this.owner.notRenderable = true;
        this.#checkNode();
    }

    linkMesh(target: AbstractMesh) {
        this.target = target;
        this.#observer = this._scene.onBeforeCameraRenderObservable.add(this.#checkMesh);
        this.owner.notRenderable = true;
        this.#checkMesh();
    }

    linkControl(target: Control) {
        this.target = target;
        this.#observer = this._scene.onBeforeCameraRenderObservable.add(this.#checkControl);
        this.owner.notRenderable = true;
        this.#checkControl();
    }

    unlink() {
        if (this.#observer) {
            this.#observer.remove();
            this.#observer = null;
        }
        this.target = null;
        this.x = null;
        this.y = null;
    }

    #checkNode = () => {
        const target = this.target as TransformNode; 
        const projected = Vector3.Project(Vector3.ZeroReadOnly, target.getWorldMatrix(), this._scene!.getTransformMatrix(), this._host._getGlobalViewport());
        this.toggleOwner(target.isEnabled() && 0.0 < projected.z && projected.z < 1.0);
        if (this.isActive) this.update(projected.x, projected.y);
    }

    #checkMesh = () => {
        const target = this.target as AbstractMesh; 
        const projected = Vector3.Project(target.getBoundingInfo().boundingSphere.center, target.getWorldMatrix(), this._scene!.getTransformMatrix(), this._host._getGlobalViewport());
        this.toggleOwner(target.isEnabled() && 0.0 < projected.z && projected.z < 1.0);
        if (this.isActive) this.update(projected.x, projected.y);
    }

    #checkControl = () => {
        const target = this.target as Control
        this.toggleOwner(target.isVisible && target.isEnabled);
        if (this.isActive) this.update(target.centerX, target.centerY);
    }

    update(x: number, y: number) {
        const newx = x + this.owner.linkOffsetXInPixels;
        const newy = y + this.owner.linkOffsetYInPixels;
        // check by value to avoid false dirtyness
        if (this.x == null || this.y == null || Math.abs(this.x - newx) > 1 || Math.abs(this.y - newy) > 1) {
            this.x = newx;
            this.y = newy;
            this.owner._markAsDirty();
        }
    }

    toggleOwner(renderable: boolean) {
        // avoids false dirtiness
        if (this.owner.notRenderable != !renderable) this.owner.notRenderable = !renderable; 
    }
}
