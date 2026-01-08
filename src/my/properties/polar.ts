import { Tools } from "@babylonjs/core/Misc/tools";
import { type Nullable } from "@babylonjs/core/types";
import { assert } from "@utils/asserts";

export interface Polar {
    a: number; // alpha, azimuth
    b: number; // beta, elevation
    r: number; // radius
}

export interface CamPolar {
    alpha: number; // radians
    beta: number; // radians
    radius: number; 
}

/**
 * Converter for polar coords attributes
 *
 * Attribute value: "[number, number, number]" indegrees
 * Property value: {a, b, r} (babylon-unaware), in degrees
 */
export const polarConverter = {
    fromAttribute(value: Nullable<string>): Nullable<Polar> {
        if (value === null) return null;
        let result;
        try {
            result = JSON.parse(value);
            assert(Array.isArray(result) && result.length == 3 && result.every((it) => typeof it == "number"));
            return {
                a: result[0],
                b: result[1],
                r: result[2],
            };
        } catch {
            throw Error("Invalid coords attribute");
        }
    },
    fromCam(value: Nullable<CamPolar>): Nullable<Polar> {
        if (value === null) return null;
        return {
            a: Tools.ToDegrees(value.alpha),
            b: Tools.ToDegrees(value.beta),
            r: value.radius
        };
    },
    toCam(value: Nullable<Polar>): Nullable<CamPolar> {
        if (value === null) return null;
        return {
            alpha: Tools.ToRadians(value.a),
            beta: Tools.ToRadians(value.b),
            radius: value.r
        };
    },
};
