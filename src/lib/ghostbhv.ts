import type { Behavior } from "@babylonjs/core/Behaviors/behavior";
import { Epsilon, Quaternion, Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Observer } from "@babylonjs/core/Misc/observable";
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

    _attachedNode: Nullable<TransformNode> = null;
    get attachedNode() { return this._attachedNode; }

    _targetMesh: Nullable<AbstractMesh> = null;
    get targetMesh(): Nullable<AbstractMesh> { return this._targetMesh; }
    set targetMesh(target: Nullable<AbstractMesh>) {
        this.#clearObservers();
        this._targetMesh = target;
        if (this._targetMesh) this.#setupObservers(); 
        this.reset();
    }

    init() {}

    attach(ghost: TransformNode, target?: AbstractMesh) {
        assert(ghost.scaling.equals(Vector3.One()), "ghost should be scale 1");
        this._attachedNode = ghost;
        this._attachedNode.rotationQuaternion = new Quaternion();
        this.targetMesh = target ?? null;
    }

    detach() {
        this.targetMesh = null;
        this._attachedNode = null;
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
        assertNonNull(this._attachedNode);
        if (this._targetMesh) {
            const { pos, dim, rot } = this.#getGoal();
            this._attachedNode.position = pos;
            this._attachedNode.scaling = dim;
            this._attachedNode.rotationQuaternion = rot;
            this._attachedNode.isVisible = this._targetMesh.isVisible && !this.autoHide;
            this.#updating();
        } else {
            this._attachedNode.isVisible = false;
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
        assertNonNull(this._targetMesh);
        assertNonNull(this._attachedNode);

        let updated = false;
        let updating = false;
        let delta: Vector3;
        if (this._goalPos !== null) {
            delta = this._goalPos.subtract(this._attachedNode.position).scale(this.draggingRatio);
            updating = delta.length() > Epsilon
            if (updating) {
                this._attachedNode.position.addInPlace(delta);
            } else {
                this._attachedNode.position.copyFrom(this._goalPos);
                this._goalPos = null;
            }
            updated ||= updating;
        }

        if (this._goalDim !== null) {
            delta = this._goalDim.subtract(this._attachedNode.scaling).scale(this.draggingRatio);
            updating = delta.length() > Epsilon
            if (updating) {
                this._attachedNode.scaling.addInPlace(delta);
            } else {
                this._attachedNode.scaling.copyFrom(this._goalDim);
                this._goalDim = null;
            }
            updated ||= updating;
        }

        if (this._goalRot !== null) {
            // TODO
        }

        if (updated) {
            this.attachedNode?.computeWorldMatrix();
            this._attachedNode!.isVisible = true;
        } else if (this.autoHide) {
            this._attachedNode!.isVisible = false;
        }

   }
}