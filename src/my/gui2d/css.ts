import { Control } from "@babylonjs/gui/2D/controls/control";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { assert } from "@utils/asserts";

class StyleProperty {
    key: string;
    prop: string;

    constructor(
        key: string, 
        prop?: string, 
    ) {
        this.key = key;
        this.prop = prop ??  key;
    }

    static extract(style: CSSStyleDeclaration, prop: StyleProperty) {
        const value = style.getPropertyValue(prop.key);
        if (value == "") return null;
        return { prop, value };
    }

    apply(ctrl: any, value: string) {
        if (value === null) return;
        this.validate(ctrl);
        this.assign(ctrl, value);
    }

    validate(ctrl: any) {
        if (this.key.startsWith('border-')) assert(ctrl instanceof Rectangle, `Expected rectangle for ${this.key}`)
        assert(this.prop in ctrl, `Invalid style ${this.key}/${this.prop}`);
    }

    assign(ctrl: any, value: string) {
        ctrl[this.prop] = value;
    }
}

class StylePropertyFloat extends StyleProperty {
    override assign(ctrl: any, value: string) {
        ctrl[this.prop] = parseFloat(value);
    }
}

class StylePropertyInt extends StyleProperty {
    override assign(ctrl: any, value: string) {
        ctrl[this.prop] = parseInt(value);
    }
}

class StylePropertyPadding extends StyleProperty {
    override assign(ctrl: any, value: string) {
        ctrl.setPadding(...value.split(' '))
    }
}

class StylePropertyAlignment extends StyleProperty {
    static values: {[key: string]: number} = {
        'left': Control.HORIZONTAL_ALIGNMENT_LEFT,
        'right': Control.HORIZONTAL_ALIGNMENT_RIGHT,
        'center': Control.HORIZONTAL_ALIGNMENT_CENTER,
        'top': Control.VERTICAL_ALIGNMENT_TOP,
        'bottom': Control.VERTICAL_ALIGNMENT_BOTTOM,
        'middle': Control.VERTICAL_ALIGNMENT_CENTER,
    }

    override assign(ctrl: any, value: string) {
        ctrl[this.prop] = StylePropertyAlignment.values[value];
    }
}

const PROPS = [
    new StyleProperty('color'),
    new StyleProperty('background-color', 'background'),
    new StyleProperty('stroke', 'color'),
    new StyleProperty('fill', 'background'),
    new StylePropertyFloat('opacity', 'alpha'),
    new StylePropertyInt('stroke-width', 'thickness'),
    new StylePropertyPadding('padding', 'setPadding'),

    new StyleProperty('width'),
    new StyleProperty('height'),
    new StyleProperty('left'),
    new StyleProperty('top'),

    new StyleProperty('border-color', 'color'),
    new StylePropertyInt('border-width', 'thickness'),
    new StylePropertyInt('border-radius', 'cornerRadius'),
    new StylePropertyAlignment('--halign', 'horizontalAlignment'),
    new StylePropertyAlignment('--valign', 'verticalAlignment'),
]

export function applyCSSStyle(ctrl: Control, style: CSSStyleDeclaration, keys?: string[]) {
    const props = keys ? PROPS.filter(p => keys.includes(p.key)) : PROPS;
    props.map(p => StyleProperty.extract(style, p)).filter(pv => pv !== null).forEach(({prop, value}) => {
        prop.apply(ctrl, value)
    });
}