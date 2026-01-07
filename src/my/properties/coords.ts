import { Vector3 } from "@babylonjs/core/Maths/math";
import type { Nullable } from "@babylonjs/core/types";
import { assert } from "@utils/asserts";

export interface Coords {
    x: number;
    y: number;
    z: number;
}

/**
 * Converter for position attributes
 *
 * Attribute value: "[number, number, number]"
 * Property value: {x, y, z} (babylon-unaware)
 */
export const coordsConverter = {
    fromAttribute(value: Nullable<string>): Nullable<Coords> {
        if (value === null) return null;
        let result;
        try {
            result = JSON.parse(value);
            assert(Array.isArray(result) && result.length == 3 && result.every((it) => typeof it == "number"));
            return {
                x: result[0],
                y: result[1],
                z: result[2],
            };
        } catch {
            throw Error("Invalid coords attribute");
        }
    },
    toAttribute(value: Nullable<Coords>): Nullable<string> {
        if (value === null) return null;
        return JSON.stringify([value.x, value.y, value.z]);
    },
    fromVector3(value: Vector3): Coords {
        return { x: value.x, y: value.y, z: value.z };
    },
    toVector3(value: Coords): Vector3 {
        return new Vector3(value.x, value.y, value.z);
    },
};
