import { Color3, Color4 } from "@babylonjs/core/Maths";
import type { Nullable } from "@babylonjs/core/types";
import { formatCSSColor, parseCSSColor, type RGB } from "@utils/colors";

/**
 * Converter for color attributes
 *
 * Attribute value: "#RRGGBB", "#RRGGBBAA", "rgb(...)", "rgba(...)"
 * Property value: {r, g, b, a?} (babylon-unaware)
 */
export const colorConverter = {
    fromAttribute(value: Nullable<string>): Nullable<RGB> {
        if (value === null) return null;
        return parseCSSColor(value);
    },
    toAttribute(value: Nullable<RGB>): Nullable<string> {
        if (value === null) return null;
        return formatCSSColor(value);
    },
    fromColor(value: Color3 | Color4): RGB {
        const {r, g, b} = value;
        return 'a' in value ? { r, g, b, a: value.a } : { r, g, b }; 
    },
    toColor3(value: RGB): Color3 {
        return new Color3(value.r, value.g, value.b); 
    },
    toColor4(value: RGB): Color4 {
        return new Color4(value.r, value.g, value.b, value.a ?? 1.0); 
    },
    fromColor3(value: Color3): RGB {
        const {r, g, b} = value;
        return {r, g, b}; 
    },
    fromColor4(value: Color4): RGB {
        const {r, g, b, a} = value;
        return {r, g, b, a}; 
    }
}
