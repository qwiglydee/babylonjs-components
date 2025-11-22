import { ArcRotateCamera, ComputeAlpha, ComputeBeta } from "@babylonjs/core/Cameras/arcRotateCamera";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import { Lerp, Vector3 } from "@babylonjs/core/Maths";

/**
 * Sets some parameters with interpolation
 */
export function smoothParams(camera: ArcRotateCamera, params: { alpha?: number; beta?: number; radius?: number; target?: Vector3 }) {
    camera.interpolateTo(params.alpha ?? camera.alpha, params.beta ?? camera.beta, params.radius ?? camera.radius, params.target ?? camera.target);
}

/**
 * Rotates camera towards new target, keeping current location
 * TODO: calculate best arc interpolation
 */
export function smoothTarget(camera: ArcRotateCamera, targetVec: Vector3) {
    const vector = camera.position.subtract(targetVec);
    const dist = vector.length();
    camera.interpolateTo(ComputeAlpha(vector), ComputeBeta(vector.y, dist), dist, targetVec);
}

/**
 * Rotates camera towards new target and zooms to best view
 * TODO: calculate best arc interpolation
 */
export function smoothFocus(camera: ArcRotateCamera, targetBounds: BoundingInfo, focusFactor: number = 1.0, zoomFactor: number = 1.0) {
    const bbox = targetBounds.boundingBox;
    const targetVec = bbox.centerWorld;
    const vector = camera.position.subtract(targetVec);
    const dist = vector.length();
    const best = camera._calculateLowerRadiusFromModelBoundingSphere(bbox.minimumWorld, bbox.maximumWorld, zoomFactor);
    const radius = Lerp(dist, best, focusFactor);
    camera.interpolateTo(ComputeAlpha(vector), ComputeBeta(vector.y, dist), radius, targetVec);
}
