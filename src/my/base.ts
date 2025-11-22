import { consume } from "@lit/context";
import { ReactiveElement } from "lit";

import { Scene } from "@babylonjs/core";
import { assertNonNull } from "@utils/asserts";

import { sceneCtx } from "./context";


export abstract class SceneElement extends ReactiveElement {
    protected override createRenderRoot() {
        return this;
    }  

    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    override connectedCallback(): void {
        super.connectedCallback();
        assertNonNull(this.scene); // just in case
        this.init();
    }

    override disconnectedCallback(): void {
        this.dispose();
        super.disconnectedCallback();
    }

    abstract init(): void;
    abstract dispose(): void;
} 