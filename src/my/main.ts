import { ContextProvider, provide } from "@lit/context";
import { customElement, property, query, state } from "lit-element/decorators.js";
import { css, html, type PropertyValues } from "lit-element";

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

/**
 * Main component for the demo app
 * Creates usual engine and scene.
 * 
 * Includes loading screen, but for now it only spins initially
 * Addon controllers:
 * - PickingCtrl: picking by pointer tap
 * - DraggingCtrl: moving the picked mesh  
 * 
 * Important and auxiliary content of the scene are differentiated by 'aux' tag.
 * Content update is determined by adding/removed important meshes
 * It can be enforced in other cases (like, moving) by calling `.requestUpdate('model')`
 * 
 * @context babylon.main: itself, constant
 * @context babylon.scene: the scene, constant
 * @context babylon.model: the same scene as `IModelContainer`
 *   - it's visible through utility layer with it's own scene
 *   - updated forcedly (with the same value) when content changes   
 * @context babylon.bounds: bounds of model in scene (not counting auxiliary stuff)
 *   - updated when content changed, initialy is 1x1x1 bbox
 * @context babylon.picked: selected mesh set by add-on controller
 *
 * @event babylon.init: when initialized and get ready
 * @event babylon.update: when content changed
 * @event babylon.pick: some mesh picked or unpicked
 */
@customElement("b3d-main")
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

    #selfCtx = new ContextProvider(this, { context: mainCtx, initialValue: this });

    model!: IModelContainer;

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

            b3d-screen {
                z-index: 2;
            }
        `,
    ];

    override _renderHTML() {
        return html`
            ${this.canvas}
            <slot name="overlay"></slot>
            <b3d-screen></b3d-screen>
        `;
    }

    @query("b3d-screen")
    _screen!: HTMLElement & ILoadingScreen;

    _init() {
        this.engine = new Engine(this.canvas, undefined, MainElem.ENGINEOPTIONS);
        this.engine.loadingScreen = this._screen;
        // this.engine.loadingScreen.loadingUIBackgroundColor = this.background;

        this.scene = new Scene(this.engine);
        this.scene.useRightHandedSystem = this.rightHanded;
        // this.scene.clearColor = Color4.FromHexString(this.background);

        // @ts-ignore
        this.model = this.scene as IModelContainer;
        this.model.isEmpty = true;
        this.#modelCtx.setValue(this.model);

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

    /** 
     * very public API to get content
     * TODO: add tags
     */
    getStuff() {
        return this.scene.getMeshesByTags("!aux").map((item) => {
            return { name: item.name, id: item.id };
        });
    }
}
