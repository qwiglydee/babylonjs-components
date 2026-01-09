import { consume } from "@lit/context";
import { type PropertyValues, ReactiveElement } from "lit";

import type { Scene } from "@babylonjs/core/scene";

import { mainCtx, sceneCtx } from "../context";
import type { IMyMain } from "../interfaces";

/**
 * The very base of elements contributing something to scene
 *
 * Lifecycle:
 * - init() // when created and attached
 * - update(changes) // when properties update
 * - dispose() // when detached
 *
 * Note: Expecting parent babylon element already deployed.
 * With static HTML, all components' modules (with `customElement`/`customElements.define`)
 * should be imported after main babylon element.
 *
 * @TODO explore and test creating components in shadow dom of the main
 */
export abstract class ComponentElemBase extends ReactiveElement {
    protected override createRenderRoot() {
        // disable shadow dom
        return this;
    }

    /**
     * Context reference to main babylon element.
     * Expected to be initialized before any children created.
     */
    @consume({ context: mainCtx, subscribe: false })
    main!: IMyMain;

    /**
     * Context reference to working scene.
     * This might be either main scene or utility scene.
     * Main scene is at `this.main.scene`
     */
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    /**
     * Initialize a scene entity
     *
     * Called after element is created and connected to parent.
     * All element properties are already initialized to default values or parsed attributes.
     *
     * Implement creation of some scene entities here.
     */
    abstract init(): boolean | void;

    /**
     * Update scene entity
     *
     * Called when properties changes after initialization.
     * (Not called for initial/default values)
     *
     * Override to update scene entity if needed.
     * Call to `super.update(changes)` to complete updating.
     *
     * @param changes map of changed properties (to their old values)
     */
    override update(changes: PropertyValues): void {
        super.update(changes);
    }

    // override updated(changes: PropertyValues): void {
    //     debug(this, "updated", dbgChanges(this, changes));
    // }

    /**
     * Dispose scene entity
     *
     * Called before element is disconnected from parent.
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
