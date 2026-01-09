import { ContextProvider, provide } from "@lit/context";
import { css, html, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import { type PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import { Engine } from "@babylonjs/core/Engines/engine";
import { type ILoadingScreen } from "@babylonjs/core/Loading/loadingScreen";
import { Vector3 } from "@babylonjs/core/Maths";
import { type AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Tags } from "@babylonjs/core/Misc/tags";
import { Scene } from "@babylonjs/core/scene";
import { type Nullable } from "@babylonjs/core/types";
import { bubbleEvent, queueEvent } from "@utils/events";

import { MainElemBase } from "./base/main";
import { boundsCtx, mainCtx, modelCtx, pickCtx } from "./context";
import { DraggingCtrl } from "./controllers/dragging";
import { PickingCtrl } from "./controllers/picking";
import { type BoundsInfo, type IModelContainer, type IMyMain } from "./interfaces";

@customElement("my3d-main")
export class MainElem extends MainElemBase implements IMyMain {
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

    getImportant(): AbstractMesh[] {
        return this.scene.getMeshesByTags("!aux");
    }

    /** providing self as context */
    #selfCtx = new ContextProvider(this, { context: mainCtx, initialValue: this });

    model!: IModelContainer;

    /** providing scene as model */
    #modelCtx = new ContextProvider(this, { context: modelCtx });
 
    @property({ type: Number })
    worldSize = 100;

    static DUMBOUNDS = new BoundingInfo(new Vector3(-1, -1, -1), new Vector3(+1, +1, +1));

    @provide({ context: boundsCtx })
    bounds: BoundsInfo = { model: MainElem.DUMBOUNDS, world: MainElem.DUMBOUNDS };

    @provide({ context: pickCtx })
    @state()
    picked: Nullable<PickingInfo> = null;

    #pickingCtrl = new PickingCtrl(this); // sets this.picked
    #draggingCtrl = new DraggingCtrl(this); // uses this.picked

    // @property()
    // background = "#33334D"; // just to sync all backgrounds

    static override styles = [
        ...MainElemBase.styles,
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
        this.engine = new Engine(this.canvas, undefined, MainElem.ENGINEOPTIONS);
        this.engine.loadingScreen = this._screen;
        // this.engine.loadingScreen.loadingUIBackgroundColor = this.background;

        this.scene = new Scene(this.engine);
        this.scene.useRightHandedSystem = this.rightHanded;
        // this.scene.clearColor = Color4.FromHexString(this.background);

        // @ts-ignore
        this.scene.isEmpty = true;
        // @ts-ignore
        this.model = this.scene;
        // @ts-ignore
        this.#modelCtx.setValue(this.scene);

        const affect = (mesh: AbstractMesh) => {
            if (MainElem._isImportant(mesh)) this.requestUpdate("model");
        };

        this.scene.onNewMeshAddedObservable.add(affect);
        this.scene.onMeshRemovedObservable.add(affect);
    }

    _dispose() {
        this.scene.dispose();
        this.engine.dispose();
    }

    override _onready() {
        super._onready();
        this._screen.hideLoadingUI();
        queueEvent(this, "babylon.init");
        this.requestUpdate("model");
    }

    override update(changes: PropertyValues): void {
        if (changes.has("model")) {
            this.model.isEmpty = this.getImportant().length == 0;
            this.#modelCtx.setValue(this.model, true); // forced
            this.bounds = !this.model.isEmpty ? this._getBounds() : { model: MainElem.DUMBOUNDS, world: MainElem.DUMBOUNDS };
        }
        super.update(changes);
    }

    override updated(changes: PropertyValues): void {
        if (changes.has("model")) {
            bubbleEvent(this, "babylon.update");
        }
        if (changes.has("picked")) {
            if (this.picked?.pickedMesh) {
                const mesh = this.picked.pickedMesh!;
                bubbleEvent(this, "babylon.pick", {
                    name: mesh.name,
                    id: mesh.id,
                    enabled: mesh.isEnabled(),
                    visible: mesh.isVisible,
                });
            } else {
                bubbleEvent(this, "babylon.pick", null);
            }
        }
    }

    _getBounds(): BoundsInfo {
        // actual model
        const modelext = this.scene.getWorldExtends((m) => m.isEnabled() && MainElem._isImportant(m));
        const model = new BoundingInfo(modelext.min, modelext.max);

        // possible model mirrored around 0
        const worldext = this.scene.getWorldExtends((m) => MainElem._isImportant(m));
        const world = new BoundingInfo(
            new Vector3(Math.min(worldext.min.x, -worldext.max.x), Math.min(worldext.min.y, -worldext.max.y), Math.min(worldext.min.z, -worldext.max.z)),
            new Vector3(Math.max(worldext.max.x, -worldext.min.x), Math.max(worldext.max.y, -worldext.min.y), Math.max(worldext.max.z, -worldext.min.z))
        );

        return { model, world };
    }

    getStuff() {
        return this.scene.getMeshesByTags("!aux").map((item) => {
            return { name: item.name, id: item.id };
        });
    }
}
