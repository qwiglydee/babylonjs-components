export interface ISceneItem {
    name: string;
    id: string;
    enabled?: boolean;
    visible?: boolean;
}

export interface IBabylonElem extends HTMLElement {
    /** TODO: some public API **/
    getStuff(): ISceneItem[];
}

export interface IComponentElem extends HTMLElement {
    enabled?: boolean;
    visible?: boolean;
}

export type BabylonEvent = CustomEvent;
export type BabylonPickEvent = CustomEvent<ISceneItem | null>;
export type BabylonUpdateEvent = CustomEvent; 


declare global {
    interface GlobalEventHandlersEventMap {
        "babylon.init": BabylonEvent;
        "babylon.update": BabylonUpdateEvent;
        "babylon.pick": BabylonPickEvent;
    }
}
