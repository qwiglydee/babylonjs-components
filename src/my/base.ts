import { consume } from "@lit/context";
import { PropertyValues, ReactiveElement } from "lit";
import { property } from "lit/decorators.js";

import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { assertNonNull } from "@utils/asserts";

import { babylonCtx, IBabylonElem, sceneCtx } from "./context";
import { Tags } from "@babylonjs/core/Misc/tags";

type Enableble = { setEnabled(val: boolean): void } | { isEnabled: boolean };


export abstract class SceneElement extends ReactiveElement {
    protected override createRenderRoot() {
        return this;
    }

    @consume({ context: babylonCtx, subscribe: false })
    babylon!: IBabylonElem;

    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene; // NB: either main scene or utility scene

    @property({ type: Boolean, reflect: true })
    disabled = false;

    get enabled() { return !this.disabled }
    set enabled(val: boolean) { this.disabled = !val; }

    override connectedCallback(): void {
        super.connectedCallback();
        assertNonNull(this.scene); // just in case
        this.init();
    }

    override disconnectedCallback(): void {
        this.dispose();
        super.disconnectedCallback();
    }

    override willUpdate(changed: PropertyValues) {
        if (changed.has('disabled')) this.toggle(this.enabled);
    }

    _syncEnabled(object: Enableble, enabled: boolean) {
        this.enabled = enabled; // for babylon-originated toggle
        if ('setEnabled' in object) object.setEnabled!(enabled);
        else if ('isEnabled' in object) object.isEnabled = enabled;
        else throw Error("Not enablebla object");
    } 

    _setId(object: Node) {
        if (this.id) object.id = this.id;
    }

    _setTags(object: Node) {
        const classes = this.getAttribute('class');
        if (classes) Tags.AddTagsTo(object, classes);
    }

    abstract init(): void;
    abstract dispose(): void;
    abstract toggle(enabled: boolean): void;
} 