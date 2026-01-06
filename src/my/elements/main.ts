import { ContextProvider, provide } from "@lit/context";
import { css, html, PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import { Engine } from "@babylonjs/core/Engines/engine";
import { ILoadingScreen } from "@babylonjs/core/Loading/loadingScreen";
import { Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Observable } from "@babylonjs/core/Misc/observable";
import { Tags } from "@babylonjs/core/Misc/tags";
import { Node as BabylonNode } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";
import { querySelectorNode, querySelectorNodes } from "@lib/queryselecting";
import { debug } from "@utils/debug";
import { bubbleEvent, queueEvent } from "@utils/events";

import { BabylonMainBase } from "../base/main";
import { babylonCtx, boundsCtx, BoundsInfo, IBabylonElem, pickCtx } from "../context";
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { PickingCtrl } from "../controllers/picking";
import { DraggingCtrl } from "../controllers/dragging";

@customElement("my3d-main")
export class MyMainElem extends BabylonMainBase implements IBabylonElem {
    /** orientation of scene */
    @property({ type: Boolean })
    rightHanded = false;

    static ENGINEOPTIONS = {
        antialias: true,
        stencil: true, //  for highlighter
        doNotHandleContextLost: true,
    };

    static _isImportant(mesh: AbstractMesh) {
        return Tags.MatchesQuery(mesh, "!aux");
    }

    /** providing self as context */
    selfCtx = new ContextProvider(this, { context: babylonCtx, initialValue: this });

    @property({ type: Number })
    worldSize = 100;

    onSceneObservable = new Observable<Scene>();

    static DUMBOUNDS = new BoundingInfo(new Vector3(-1, -1, -1), new Vector3(+1, +1, +1));

    @provide({ context: boundsCtx })
    bounds: BoundsInfo = { model: MyMainElem.DUMBOUNDS, world: MyMainElem.DUMBOUNDS };

    @provide({ context: pickCtx })
    @state()
    picked: Nullable<PickingInfo> = null;
    onPickedObservable = new Observable<Nullable<PickingInfo>>();
    
    #pickingCtrl = new PickingCtrl(this); // sets this.picked
    #draggingCtrl = new DraggingCtrl(this); // uses this.picked

    // @property()
    // background = "#33334D"; // just to sync all backgrounds

    static override styles = [
        ...BabylonMainBase.styles,
        css`
            slot[name="overlay"] {
                position: absolute;
                display: block;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: none;
            }

            my3d-screen {
                z-index: 2;
            }
        `,
    ];

    override _renderHTML() {
        return html`
            ${this.canvas}
            <slot name="overlay"></slot>
            <my3d-screen></my3d-screen>
        `;
    }

    @query("my3d-screen")
    _screen!: HTMLElement & ILoadingScreen;

    // _pickCtrl = new PickingCtrl(this);
    // _moveCtrl = new MoveingCtrl(this);

    // @ts-ignore
    override connectedMoveCallback() {
        // keep context when reconnecting (not widely available)
    }

    _init() {
        debug(this, "initializing");
        this.engine = new Engine(this.canvas, undefined, MyMainElem.ENGINEOPTIONS);
        this.engine.loadingScreen = this._screen;
        // this.engine.loadingScreen.loadingUIBackgroundColor = this.background;

        this.scene = new Scene(this.engine);
        this.scene.useRightHandedSystem = this.rightHanded;
        // this.scene.clearColor = Color4.FromHexString(this.background);

        const affect = (mesh: AbstractMesh) => {
            if (MyMainElem._isImportant(mesh)) this.requestUpdate("scene");
        };

        this.scene.onNewMeshAddedObservable.add(affect);
        this.scene.onMeshRemovedObservable.add(affect);
    }

    _dispose() {
        this.scene.dispose();
        this.engine.dispose();
    }

    override _onready() {
        debug(this, "ready");
        super._onready();
        this._screen.hideLoadingUI();
        queueEvent(this, "babylon.init");
        this.requestUpdate('scene');
    }

    override update(changes: PropertyValues): void {
        if (changes.has("scene")) {
            this.bounds = this.getBounds();
        }
        super.update(changes);
    }

    override updated(changes: PropertyValues): void {
        debug(this, "updated");
        if (changes.has("scene")) {
            this.onSceneObservable.notifyObservers(this.scene);
            bubbleEvent(this, "babylon.update");
        }
        if (changes.has("picked")) {
            if (this.picked) {
                this.onPickedObservable.notifyObservers(this.picked);
                const mesh = this.picked.pickedMesh!;
                bubbleEvent(this, "babylon.pick", {
                    name: mesh.name,
                    id: mesh.id,
                    enabled: mesh.isEnabled(),
                    visible: mesh.isVisible,
                });
            } else {
                this.onPickedObservable.notifyObservers(null);
                bubbleEvent(this, "babylon.pick", null);
            }
        }
    }

    getBounds(): BoundsInfo {
        // kinda fixed already
        const invalid = (ext: any) => ext.min.x === Number.MAX_VALUE || ext.min.x == ext.max.x;

        // actual visible model
        const modelext = this.scene.getWorldExtends((m) => m.isEnabled() && MyMainElem._isImportant(m));
        const model = invalid(modelext) ? MyMainElem.DUMBOUNDS : new BoundingInfo(modelext.min, modelext.max);

        // possible model mirrored around 0
        const worldext = this.scene.getWorldExtends((m) => MyMainElem._isImportant(m));
        const world = invalid(worldext)
            ? MyMainElem.DUMBOUNDS
            : new BoundingInfo(
                  new Vector3(Math.min(worldext.min.x, -worldext.max.x), Math.min(worldext.min.y, -worldext.max.y), Math.min(worldext.min.z, -worldext.max.z)),
                  new Vector3(Math.max(worldext.max.x, -worldext.min.x), Math.max(worldext.max.y, -worldext.min.y), Math.max(worldext.max.z, -worldext.min.z))
              );

        return { model, world };
    }

    querySelectorNodes(query: string): BabylonNode[] {
        return querySelectorNodes(this.scene, query);
    }

    querySelectorNode(query: string): Nullable<BabylonNode> {
        return querySelectorNode(this.scene, query);
    }

    getStuff() {
        return this.scene.getMeshesByTags("!aux").map((item) => {
            return { name: item.name, id: item.id };
        });
    }
}
