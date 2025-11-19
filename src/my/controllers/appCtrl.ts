import { ReactiveController } from "lit";
import { IBabylonElem } from "../context";


export abstract class BabylonCtrl implements ReactiveController {
    host: IBabylonElem;

    get scene() { return this.host.scene; }

    constructor(host: IBabylonElem) {
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