import { Epsilon, Vector2, Vector3 } from "@babylonjs/core/Maths";

export function HomoPoint(point: Vector2): Vector3 {
    return new Vector3(point.x, point.y, 1);
}

export function HomoVector(vector: Vector2): Vector3 {
    return new Vector3(vector.x, vector.y, 0);
}

export function HomoLine(point: Vector2, normal: Vector2): Vector3 {
    return new Vector3(normal.x, normal.y, -Vector2.Dot(point, normal))
}

export function HomoRay(point: Vector2, direction: Vector2): Vector3 {
    return HomoLine(point, new Vector2(direction.y, -direction.x));
}

export function homoFinite(point: Vector3): boolean {
    return Math.abs(point.z) > Epsilon; 
}

export function DehomoPoint(point: Vector3): Vector2 {
    return new Vector2(point.x / point.z, point.y / point.z);
}

export function homoDistance(line: Vector3, pnt: Vector3): number {
    return Vector3.Dot(line, pnt);
}

export function homoVisible(line: Vector3, pnt: Vector3): boolean {
    return homoDistance(line, pnt) > 0;
}

export function homoClosest(line: Vector3, pnt: Vector3): Vector3 {
    return pnt.subtract(line.scale(Vector3.Dot(line, pnt)));
} 

export function homoIntersect(line1: Vector3, line2: Vector3): Vector3 {
    return Vector3.Cross(line1, line2);
}
