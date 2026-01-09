import { consume } from "@lit/context";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Nullable } from "@babylonjs/core/types";
import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { MySpot } from "@lib/gui2/spot";
import { querySelectorNodes } from "@lib/queryselecting";
import { formatCSSColor, parseCSSColor } from "@utils/colors";

import { GUI2ComponentBase } from "../../base/gui2";
import { modelCtx } from "../../context";
import { BabylonControllerBase } from "../../controllers/base";
import type { IModelContainer } from "../../interfaces";

export class TouchBlinkCtrl extends BabylonControllerBase<MyGUI2SpotElem> {
    #observer: any;

    override init() {
        this.#observer = this.host.main.scene.onPointerObservable.add((info: PointerInfo) => {
            if (!this.host._blinkAnimation) return;
            if (!info.pickInfo?.hit) {
                if (info.type == PointerEventTypes.POINTERDOWN) this.host._blinkAnimation.play(false);
                if (info.type == PointerEventTypes.POINTERUP) {
                    this.host._blinkAnimation.stop();
                    this.host._blinkAnimation.reset();
                }
            }
        });
    }

    override dispose(): void {
        this.#observer?.remove();
    }
}

@customElement("my2g-hotspot")
export class MyGUI2SpotElem extends GUI2ComponentBase {
    @consume({ context: modelCtx, subscribe: true })
    @state({ hasChanged: () => true }) // do not compare
    model!: IModelContainer;

    @property()
    anchor = "";

    @state()
    __targets: TransformNode[] = [];

    get valid(): boolean {
        return this.__targets.length > 0;
    }

    // not updatable
    @property({ type: Boolean })
    blinking = false;

    _proto!: MySpot;

    _blinkAnimation: Nullable<AnimationGroup> = null;

    _blinkCtrl = new TouchBlinkCtrl(this);

    override init(): void {
        this._proto = new MySpot("spot");

        this.applyStyle(this._proto);
        this.applyStyle(this._proto, ["offset"]);

        // FIXME
        const color = parseCSSColor(this._proto.color);
        const gradient = new RadialGradient(0, 0, 0, 0, 0, this._proto.radius);
        gradient.addColorStop(0.0, formatCSSColor({ ...color, a: 1.0 }));
        gradient.addColorStop(1.0, formatCSSColor({ ...color, a: 0.0 }));
        this._proto.gradient = gradient;
    }

    override dispose(): void {
        super.dispose();
        this._proto.dispose();
    }

    override update(changes: PropertyValues) {
        if (changes.has("anchor") || changes.has("model")) this.#rescan();
        if (changes.has("__targets")) this.#rettach();
        if (changes.has("__targets") || changes.has("blinking")) this.#setupBlinking();

        this.visible = this.valid;
        super.update(changes);
    }

    #rescan() {
        if (!this.anchor) this.__targets = [];
        else {
            const targets = new Set(querySelectorNodes(this.model, this.anchor) as TransformNode[]);
            const diff = targets.symmetricDifference(new Set(this.__targets));
            if (diff.size) this.__targets = Array.from(targets);
        }
    }

    #rettach() {
        let _spots = this._controls as MySpot[];
        const targets = new Set(this.__targets);
        const spotted = new Set(_spots.map((_) => _.anchor.target));
        const addnodes = targets.difference(spotted);
        const delnodes = spotted.difference(targets);

        if (addnodes.size == 0 && delnodes.size == 0) return;

        if (delnodes.size) {
            _spots.filter((s) => delnodes.has(s.anchor.target)).forEach((s) => s.dispose());
            _spots = _spots.filter((s) => s.parent !== null); // == not disposed
        }

        if (addnodes.size) {
            _spots = _spots.concat(Array.from(addnodes).map((n) => this.#newspot(n)));
        }

        this._controls = _spots;
    }

    #newspot(anchor: TransformNode): MySpot {
        const clone = this._proto.clone() as MySpot;
        this.addControl(clone);
        clone.anchor.target = anchor;
        return clone;
    }

    #setupBlinking() {
        if (this.blinking) {
            if (this._blinkAnimation) this._blinkAnimation?.dispose();
            const animation = MySpot.createBlinkingAnimation(24, 12);
            this._blinkAnimation = new AnimationGroup("blinking");
            this._controls.forEach((_) => (_.alpha = 0));
            this._controls.forEach((_) => this._blinkAnimation!.addTargetedAnimation(animation, _));
        } else {
            this._blinkAnimation?.dispose();
            this._blinkAnimation = null;
            this._controls.forEach((_) => (_.alpha = this._proto.alpha));
        }
    }

    blink() {
        if (this._blinkAnimation) this._blinkAnimation.play(false);
    }
}
