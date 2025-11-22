import { LitElement, PropertyValues, ReactiveElement } from "lit";
import { consume } from "@lit/context";

import { babylonCtx, IBabylonElem } from "./context";

/**
 * Element linked to neighbour babylon element
 * It does not update until babylon is ready
 */
export abstract class LinkedElement extends LitElement {
    @consume({ context: babylonCtx, subscribe: true })
    babylon: IBabylonElem | null = null;

    protected override shouldUpdate(_changedProperties: PropertyValues): boolean {
        return this.babylon !== null;
    }

    protected override willUpdate(): void {
        if (!this.hasUpdated && this.babylon !== null) this.linkedCallback();
    }

    abstract linkedCallback(): void;
}

/**
 * Element linked to neighbour babylon element, wrapping some light dom 
 * It does not update until babylon is ready
 */
export abstract class WrappingElement extends ReactiveElement {
    @consume({ context: babylonCtx, subscribe: true })
    babylon: IBabylonElem | null = null;

    protected override createRenderRoot() {
        return this;
    }

    protected override shouldUpdate(_changedProperties: PropertyValues): boolean {
        return this.babylon !== null;
    }

    protected override willUpdate(): void {
        if (!this.hasUpdated && this.babylon !== null) this.linkedCallback();
    }

    abstract linkedCallback(): void;
}
