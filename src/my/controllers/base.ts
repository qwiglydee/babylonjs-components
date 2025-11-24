import { ReactiveController, ReactiveControllerHost } from "lit";

import { Scene } from "@babylonjs/core/scene";

export interface BabylonHost extends ReactiveControllerHost {
    readonly scene: Scene;
}

export abstract class BabylonController<Host extends BabylonHost> implements ReactiveController {
    host: Host;

    get scene() {
        return this.host.scene;
    }

    constructor(host: Host) {
        this.host = host;
        this.host.addController(this);
    }

    hostConnected() {
        // after host initialized
        queueMicrotask(() => this.init());
    }

    hostDisconnected() {
        this.dispose();
    }

    abstract init(): void;
    abstract dispose(): void;
}
