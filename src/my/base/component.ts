import { consume } from "@lit/context";
import { ReactiveElement, type PropertyValues } from "lit-element";

import type { Scene } from "@babylonjs/core/scene";

import { mainCtx, sceneCtx } from "../context";
import type { IMyMain } from "../interfaces";

/**
 * Base for all babylon components.
 * A proxy element without shadow.
 * Consumes contexts for main element and scene.
 * 
 * Implements lifecycle: 
 * - init() // when created
 * - update(changes)  // when properties update
 * - updated(changes) // after all updated
 * - dispose() // when deleted
 */
export abstract class ComponentElemBase extends ReactiveElement {
    protected override createRenderRoot() {
        // disable shadow dom
        return this;
    }

    /**
     * Context reference to main babylon element.
     * Available at `init` phase
     */
    @consume({ context: mainCtx, subscribe: false })
    main!: IMyMain;

    /**
     * Context reference to babylon scene.
     * This could be main scene or utility scene.
     * Available at `init` phase
     */
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    /**
     * Initialize some babylon stuff
     * 
     * Called right after element is created and connected to parent.
     * All element properties are already initialized to default values or parsed attributes.
     */
    abstract init(): void;

    /**
     * Update the babylon stuff
     *
     * Called when properties change.
     * Not called for initial/default values.
     *
     * Should call `super.update(changes)` to complete updating.
     *
     * @param changes map of changed properties (to their old values)
     */
    override update(changes: PropertyValues): void {
        super.update(changes);
    }

    // override updated(changes: PropertyValues): void {
    //     bubbleEvent('babylon.update')
    //     debug(this, "updated", dbgChanges(this, changes));
    // }

    /**
     * Dispose scene entity
     *
     * Called right before element is disconnected from parent.
     */
    abstract dispose(): void;

    ////

    override connectedCallback(): void {
        super.connectedCallback();
        this.init();
        // silent initial update cycle to settle initial values
        this.performUpdate();
        this.hasUpdated = true;
    }

    override shouldUpdate(_changedProperties: PropertyValues): boolean {
        // update only after initialization
        return this.hasUpdated;
    }

    override disconnectedCallback(): void {
        this.dispose();
        super.disconnectedCallback();
    }
}
