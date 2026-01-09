import type { ReactiveController, ReactiveControllerHost } from "lit-element";

/**
 * Controller to implement some functions.
 *
 * No assumtion on host element, it could be main, component, or gui
 */
export abstract class BabylonControllerBase<Host extends ReactiveControllerHost> implements ReactiveController {
    host: Host;

    constructor(host: Host) {
        this.host = host;
        this.host.addController(this);
    }

    /**
     * self-removing from host
     * slightly supporting dynaic controllers
     */
    remove() {
        this.dispose();
        this.host.removeController(this);
    }

    hostConnected(): void {
        queueMicrotask(() => this.init());
    }

    hostDisconnected(): void {
        this.dispose();
    }

    hostUpdate(): void {}

    hostUpdated(): void {}

    /**
     * Initialization,
     * after host connected and initialized
     * (context available)
     */
    abstract init(): void;

    /**
     * Disposal,
     * after host disposed everything, before disconnected
     * (context still available)
     */
    abstract dispose(): void;
}
