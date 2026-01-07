import type { ReactiveController, ReactiveControllerHost } from "lit";

export abstract class BabylonControllerBase<Host extends ReactiveControllerHost> implements ReactiveController {
    host: Host;
    
    constructor(host: Host) {
        this.host = host;
        this.host.addController(this);
    }

    hostConnected(): void {
        // afer connection/init completed
        queueMicrotask(() => this.init())
    }

    hostDisconnected(): void {
        this.dispose();
    }

    hostUpdate(): void {
    }

    hostUpdated(): void {
    }

    abstract init(): void;
    abstract dispose(): void;
}