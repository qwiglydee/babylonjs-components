import { Container } from "@babylonjs/gui/2D/controls/container";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

class StyleProperty {
    key: string;
    prop: string;
    pred: (c: any, v: string) => boolean;

    constructor(key: string, prop: string, pred?: (c: any, v: string) => boolean) {
        this.key = key;
        this.prop = prop;
        this.pred = pred ?? (() => true);
    }

    extract(style: CSSStyleDeclaration) {
        return style.getPropertyValue(this.key);
    }

    apply(ctrl: any, value: string) {
        if (this.valid(ctrl, value)) this.assign(ctrl, value);
    }

    valid(ctrl: any, value: string) {
        return value != "" && this.prop in ctrl && this.pred(ctrl, value);
    }

    assign(ctrl: any, value: string) {
        ctrl[this.prop] = value;
    }
}

class StylePropertyColor extends StyleProperty {
    override assign(ctrl: any, value: string) {
        ctrl[this.prop] = value;
    }
}

class StylePropertyNumber extends StyleProperty {
    override assign(ctrl: any, value: string) {
        const num = parseFloat(value);
        if (Number.isFinite(num)) ctrl[this.prop] = value; // orig value with uni suffix
    }
}

class StylePropertyFloat extends StyleProperty {
    override assign(ctrl: any, value: string) {
        const num = parseFloat(value);
        if (Number.isFinite(num)) ctrl[this.prop] = num;
    }
}

class StylePropertyInt extends StyleProperty {
    override assign(ctrl: any, value: string) {
        const num = parseInt(value);
        if (Number.isFinite(num)) ctrl[this.prop] = num;
    }
}

class StylePropertyIntNeg extends StyleProperty {
    override assign(ctrl: any, value: string) {
        const num = parseInt(value);
        if (Number.isFinite(num)) ctrl[this.prop] = -num;
    }
}

class StylePropertyIntArr extends StyleProperty {
    override assign(ctrl: any, value: string) {
        const val = value.split(', ').map(v => parseInt(v));
        if (val.every(n => Number.isFinite(n))) ctrl[this.prop] = val;
    }
}

class StylePropertyBool extends StyleProperty {
    conv: (v: string) => boolean;

    constructor(key: string, prop: string, pred: (c: any, v: string) => boolean, conv: (v: string) => boolean) {
        super(key, prop, pred);
        this.conv = conv;
    }

    override assign(ctrl: any, value: string) {
        ctrl[this.prop] = this.conv(value);
    }
}

class StylePropertyPadding extends StyleProperty {
    override assign(ctrl: any, value: string) {
        ctrl.setPadding(...value.split(" "));
    }
}

class StylePropertyAlignment extends StyleProperty {
    static values = new Map<string, number>([
        ["justify-self:start", Control.HORIZONTAL_ALIGNMENT_LEFT],
        ["justify-self:end", Control.HORIZONTAL_ALIGNMENT_RIGHT],
        ["justify-self:center", Control.HORIZONTAL_ALIGNMENT_CENTER],
        ["align-self:start", Control.VERTICAL_ALIGNMENT_TOP],
        ["align-self:end", Control.VERTICAL_ALIGNMENT_BOTTOM],
        ["align-self:center", Control.VERTICAL_ALIGNMENT_CENTER],
        ["text-align:start", Control.HORIZONTAL_ALIGNMENT_LEFT],
        ["text-align:end", Control.HORIZONTAL_ALIGNMENT_RIGHT],
        ["text-align:center", Control.HORIZONTAL_ALIGNMENT_CENTER],
        ["vertical-align:top", Control.VERTICAL_ALIGNMENT_TOP],
        ["vertical-align:bottom", Control.VERTICAL_ALIGNMENT_BOTTOM],
        ["vertical-align:middle", Control.VERTICAL_ALIGNMENT_CENTER],
    ]);

    override assign(ctrl: any, value: string) {
        const propkey = `${this.key}:${value}`;
        if (StylePropertyAlignment.values.has(propkey)) ctrl[this.prop] = StylePropertyAlignment.values.get(propkey);
    }
}

const PROPS = [
    new StylePropertyFloat("opacity", "alpha"),
    new StylePropertyColor("background-color", "background"),
    new StylePropertyColor("color", "color"),

    new StylePropertyNumber("width", "width", (_c: any, v: string) => v !== "auto"),
    new StylePropertyBool(
        "width",
        "adaptWidthToChildren",
        (c: any) => c instanceof Container,
        (v: string) => v == "auto"
    ),
    new StylePropertyNumber("height", "height", (_c: any, v: string) => v !== "auto"),
    new StylePropertyBool(
        "height",
        "adaptHeightToChildren",
        (c: any) => c instanceof Container,
        (v: string) => v == "auto"
    ),
    new StylePropertyNumber("left", "left"),
    new StylePropertyNumber("top", "top"),
    new StylePropertyPadding("padding", "setPadding"),
    new StylePropertyPadding("margin", "setPadding"),
    new StylePropertyAlignment("justify-self", "horizontalAlignment"),
    new StylePropertyAlignment("align-self", "verticalAlignment"),

    new StylePropertyColor("stroke", "color"),
    new StylePropertyColor("fill", "background"),
    new StylePropertyInt("stroke-width", "lineWidth"),
    new StylePropertyIntArr("stroke-dasharray", "dash"),

    new StyleProperty('font-family', 'fontFamily'),
    new StyleProperty('font-style', 'fontStyle'),
    new StylePropertyNumber('font-size', 'fontSize'),
    new StylePropertyAlignment("text-align", "textHorizontalAlignment", (c: any) => c instanceof TextBlock),
    new StylePropertyAlignment("vertical-align", "textVerticalAlignment", (c: any) => c instanceof TextBlock),
    new StylePropertyBool("text-wrap", "textWrapping", (c: any) => c instanceof TextBlock, (v: string) => v !== 'nowrap'), 

    new StylePropertyColor("border-color", "color", (c: any) => c instanceof Rectangle),
    new StylePropertyInt("border-width", "thickness", (c: any) => c instanceof Rectangle),
    new StylePropertyInt("border-radius", "cornerRadius", (c: any) => c instanceof Rectangle),
];

const OFFSETPROPS = [
    new StylePropertyInt("right", "linkOffsetXInPixels"),
    new StylePropertyIntNeg("left", "linkOffsetXInPixels"),
    new StylePropertyInt("bottom", "linkOffsetYInPixels"),
    new StylePropertyIntNeg("top", "linkOffsetYInPixels"),
];

export const ALLSTYLES = new Set(PROPS.map(p => p.key));
export const COLORSTYLES = new Set(['color', 'background-color', 'border-color']);
export const POSITIONSTYLES = new Set(['top', 'left', 'width', 'height', 'justify-self', 'align-self', 'margin']);
export const TEXTSTYLES = new Set(['font-family', 'font-size', 'font-style', 'text-wrap', 'text-align', 'vertical-align'])
export const BORDERSTYLES = new Set(['border-color', 'border-width', 'border-radius']);
export const DRAWSTYLES = new Set(['stroke', 'stroke-width', 'stroke-dasharray', 'fill']); 

export function applyCSSStyle(ctrl: Control, style: CSSStyleDeclaration, keys: Set<string>) {
    PROPS.filter(p => keys.has(p.key)).forEach(p => p.apply(ctrl, p.extract(style)));
}

export function applyCSSOffset(ctrl: Control, style: CSSStyleDeclaration) {
    OFFSETPROPS.forEach(p => p.apply(ctrl, p.extract(style)));
}
