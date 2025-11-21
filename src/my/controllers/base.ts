import { Scene } from "@babylonjs/core/scene";
import { ReactiveController, ReactiveControllerHost } from "lit";


export interface BabylonControllerHost extends ReactiveControllerHost  {
    scene: Scene;
}


export abstract class BabylonController<Elem extends BabylonControllerHost> implements ReactiveController {
    host: Elem;

    get scene() { return this.host.scene; }

    constructor(host: Elem) {
        this.host = host;
        this.host.addController(this);
    }

    hostConnected() {
        // after host initialized 
        queueMicrotask(() => this.init())
    };

    hostDisconnected() {
        this.dispose();
    }

    abstract init(): void;
    abstract dispose(): void;
}