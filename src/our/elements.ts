import { LitElement, PropertyValues, ReactiveElement } from "lit";
import { babylonCtx, IBabylonElem } from "./context";
import { consume } from "@lit/context";


/**
 * Element linked to neighbour babylon element
 * It does not update until babylon is ready
 */
export class LinkedElement extends LitElement {
    @consume({ context: babylonCtx, subscribe: true })
    babylon: IBabylonElem | null = null;

    protected override shouldUpdate(_changedProperties: PropertyValues): boolean {
        return this.babylon !== null;
    }

    protected override willUpdate(): void {
        if (!this.hasUpdated && this.babylon !== null) this.linkedCallback();
    }

    linkedCallback() {};
}

/**
 * Element linked to neighbour babylon element, wrapping some light dom 
 * It does not update until babylon is ready
 */
export class WrappingElement extends ReactiveElement {
    protected override createRenderRoot() {
        return this;
    }

    @consume({ context: babylonCtx, subscribe: true })
    babylon: IBabylonElem | null = null;

    protected override shouldUpdate(_changedProperties: PropertyValues): boolean {
        return this.babylon !== null;
    }

    protected override willUpdate(): void {
        if (!this.hasUpdated && this.babylon !== null) this.linkedCallback();
    }

    linkedCallback() {};
}
