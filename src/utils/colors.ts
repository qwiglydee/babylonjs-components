const cssrgb_re = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
const cssrgba_re = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*(\.\d+))\)/;

export interface RGB {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export function parseCSSRGB(rgb: string): RGB {
    const m = rgb.match(cssrgb_re);
    if (!m) throw Error("invalid color format");
    return {
        r: parseInt(m[1]) / 255,
        g: parseInt(m[2]) / 255,
        b: parseInt(m[3]) / 255,
    };
}

export function parseCSSRGBA(rgb: string): RGB {
    const m = rgb.match(cssrgba_re);
    if (!m) throw Error("invalid color format");
    return {
        r: parseInt(m[1]) / 255,
        g: parseInt(m[2]) / 255,
        b: parseInt(m[3]) / 255,
        a: parseFloat(m[4]),
    };
}

export function parseCSSHex(hex: string): RGB {
    return {
        r: parseInt(hex.substring(1, 3), 16) / 255,
        g: parseInt(hex.substring(3, 5), 16) / 255,
        b: parseInt(hex.substring(5, 7), 16) / 255,
        a: hex.length > 7 ? parseInt(hex.substring(7, 9), 16) / 255 : undefined,
    };
}

export function parseCSSColor(value: string): RGB {
    if (value.startsWith("#")) return parseCSSHex(value);
    if (value.startsWith("rgb(")) return parseCSSRGB(value);
    if (value.startsWith("rgba(")) return parseCSSRGBA(value);
    throw Error("unrecognized color format");
}

export function formatCSSColor(color: RGB): string {
    const fmt = (val: number) => Math.round(val * 255);
    return color.a !== undefined ? `rgba(${fmt(color.r)}, ${fmt(color.g)}, ${fmt(color.b)}, ${color.a.toFixed(3)})` : `rgb(${fmt(color.r)}, ${fmt(color.g)}, ${fmt(color.b)})`;
}

export function formatHexColor(color: RGB): string {
    const fmt = (val: number) => Math.round(val * 255).toString(16).toUpperCase().padStart(2, "0");
    return color.a !== undefined ? `#${fmt(color.r)}${fmt(color.g)}${fmt(color.b)}${fmt(color.a)}` : `#${fmt(color.r)}${fmt(color.g)}${fmt(color.b)}`;
}
