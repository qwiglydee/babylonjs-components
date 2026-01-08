import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Nullable } from "@babylonjs/core/types";
import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { MySpot } from "@lib/gui2/spot";
import { querySelectorNodes } from "@lib/queryselecting";
import { formatCSSColor, parseCSSColor } from "@utils/colors";

import { GUI2ComponentBase } from "../../base/gui2";
import { BabylonControllerBase } from "../../controllers/base";

export class TouchBlinkCtrl extends BabylonControllerBase<MyGUI2SpotElem> {
    #observer: any;

    override init() {
        this.#observer = this.host.main.scene.onPointerObservable.add((info: PointerInfo) => {
            if (info.type == PointerEventTypes.POINTERTAP && !info.pickInfo?.hit) this.host.blink();
        });
    }

    override dispose(): void {
        this.#observer?.remove();
    }
}

@customElement("my2g-hotspot")
export class MyGUI2SpotElem extends GUI2ComponentBase {
    @property()
    anchors = "";

    // not updatable
    @property({ type: Boolean })
    blinking = false;

    _proto!: MySpot;
    _spots: MySpot[] = [];

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

        // FIXME: make controller
        this.main.scene.onNewMeshAddedObservable.add(this.#onupdate);
        this.main.scene.onMeshRemovedObservable.add(this.#onupdate);
    }

    override dispose(): void {
        this._spots.forEach((s) => s.dispose());
        this._proto.dispose();
    }

    override update(changes: PropertyValues) {
        if (changes.has("enabled")) this._syncEnabled(this.enabled, ...this._spots);
        if (changes.has("visible")) this._syncVisible(this.visible, ...this._spots);
    }

    #setupBlinking() {
        if (this.blinking) {
            const animation = MySpot.createBlinkingAnimation(24, 12);
            this._blinkAnimation = new AnimationGroup("blinking");
            this._spots.forEach((s) => {
                s.alpha = 0;
                this._blinkAnimation!.addTargetedAnimation(animation, s);
            });
        } else {
            this._blinkAnimation?.dispose();
            this._blinkAnimation = null;
            this._spots.forEach((s) => (s.alpha = this._proto.alpha));
        }
    }

    #newspot(anchor: TransformNode | AbstractMesh): MySpot {
        const clone = this._proto.clone() as MySpot;
        this.gui.addControl(clone);
        clone.anchor.target = anchor;
        clone.gradient = this._proto.gradient;
        return clone;
    }

    #onupdate = () => {
        this.#rettach();
    };

    #rettach() {
        const matches = new Set(querySelectorNodes(this.main.scene, this.anchors) as TransformNode[]);
        const spotted = new Set(this._spots.map((s) => s.anchor.target));
        const newnodes = matches.difference(spotted);
        const delnodes = spotted.difference(matches);

        if (delnodes.size) {
            this._spots.filter((s) => delnodes.has(s.anchor.target)).forEach((s) => s.dispose());
            this._spots = this._spots.filter((s) => s.anchor.target);
        }

        if (newnodes.size) {
            this._spots = this._spots.concat(Array.from(newnodes).map((n) => this.#newspot(n)));
        }

        this.#setupBlinking();
    }

    #renable() {
        this._spots.forEach((s) => (s.isVisible = this.visible));
    }

    blink() {
        if (this._blinkAnimation) this._blinkAnimation.play(false);
    }
}
