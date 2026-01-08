import type { Behavior } from "@babylonjs/core/Behaviors/behavior";
import { Epsilon, Quaternion, Vector3 } from "@babylonjs/core/Maths";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { Nullable } from "@babylonjs/core/types";
import { assert, assertNonNull } from "@utils/asserts";

/**
 * Makes attached node to follow target mesh mimicing its position and dimension with interpolation.
 * TODO: rotation
 */
export class GhostBehavior implements Behavior<AbstractMesh> {
    draggingRatio = 0.1;
    autoHide = false; // hide after reaching target

    get name() {
        return "Ghost";
    }

    attachedNode: Nullable<AbstractMesh> = null;

    _targetMesh: Nullable<AbstractMesh> = null;
    get targetMesh(): Nullable<AbstractMesh> { return this._targetMesh; }
    set targetMesh(target: Nullable<AbstractMesh>) {
        this.#clearObservers();
        this._targetMesh = target;
        if (this._targetMesh) this.#setupObservers(); 
        this.reset();
    }

    init() {}

    attach(ghost: AbstractMesh, target?: AbstractMesh) {
        assert(ghost.scaling.equals(Vector3.One()), "ghost should be scale 1");
        this.attachedNode = ghost;
        this.attachedNode.rotationQuaternion = new Quaternion();
        this.targetMesh = target ?? null;
    }

    detach() {
        this.targetMesh = null;
        this.attachedNode = null;
    }

    #getGoal() {
        const bbox = this._targetMesh!.getBoundingInfo().boundingBox; 
        return {
            pos: bbox.centerWorld.clone(),
            dim: bbox.extendSizeWorld.scale(2),
            rot: this._targetMesh!.absoluteRotationQuaternion.clone(),
        }
    }

    reset() {
        assertNonNull(this.attachedNode);
        if (this._targetMesh) {
            const { pos, dim, rot } = this.#getGoal();
            this.attachedNode.position = pos;
            this.attachedNode.scaling = dim;
            this.attachedNode.rotationQuaternion = rot;
            this.attachedNode.isVisible = this._targetMesh.isVisible && !this.autoHide;
            this.#updating();
        } else {
            this.attachedNode.isVisible = false;
        }
    }

    #onRenderObs?: Observer<any>;
    #onChangeObs?: Observer<any>;
    #setupObservers() {
        assertNonNull(this._targetMesh);
        assertNonNull(this.attachedNode);
        this.#onChangeObs = this._targetMesh.onAfterWorldMatrixUpdateObservable.add(this.#updating);
        this.#onRenderObs = this.attachedNode.getScene().onBeforeRenderObservable.add(this.#interpolating);
    }

    #clearObservers() {
        if (this.#onChangeObs) this.#onChangeObs.remove();
        if (this.#onRenderObs) this.#onRenderObs.remove();
    }

    _goalPos: Nullable<Vector3> = null;
    _goalDim: Nullable<Vector3> = null;
    _goalRot: Nullable<Quaternion> = null;

    #updating = () => {
        if (!this._targetMesh) return;
        const { pos, dim, rot } = this.#getGoal();
        this._goalPos = pos;
        this._goalDim = dim;
        this._goalRot = rot;
    }

    // interpolation like for dragging: current += (goal - current) * ratio
    #interpolating = () => {
        assertNonNull(this.targetMesh);
        assertNonNull(this.attachedNode);

        let updated = false;
        let updating = false;
        let delta: Vector3;
        if (this._goalPos !== null) {
            delta = this._goalPos.subtract(this.attachedNode.position).scale(this.draggingRatio);
            updating = delta.length() > Epsilon
            if (updating) {
                this.attachedNode.position.addInPlace(delta);
            } else {
                this.attachedNode.position.copyFrom(this._goalPos);
                this._goalPos = null;
            }
            updated ||= updating;
        }

        if (this._goalDim !== null) {
            delta = this._goalDim.subtract(this.attachedNode.scaling).scale(this.draggingRatio);
            updating = delta.length() > Epsilon
            if (updating) {
                this.attachedNode.scaling.addInPlace(delta);
            } else {
                this.attachedNode.scaling.copyFrom(this._goalDim);
                this._goalDim = null;
            }
            updated ||= updating;
        }

        if (this._goalRot !== null) {
            // TODO
        }

        if (updated) {
            this.attachedNode?.computeWorldMatrix();
            this.attachedNode!.isVisible = true;
        } else if (this.autoHide) {
            this.attachedNode!.isVisible = false;
        }
   }
}