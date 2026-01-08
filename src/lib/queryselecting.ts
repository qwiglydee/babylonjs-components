import { Tags } from "@babylonjs/core/Misc/tags";
import type { Node as BabylonNode } from "@babylonjs/core/node";
import type { Nullable } from "@babylonjs/core/types";

import type { IModelContainer } from "../my/interfaces";

function queryMatching(query: string) {
    if (query.at(0) == "#") {
        const byid = query.substring(1);
        return (n: BabylonNode) => n.id == byid;
    } else {
        return (n: BabylonNode) => Tags.MatchesQuery(n, query);
    }
}

export function querySelectorNodes(scene: IModelContainer, query: string): BabylonNode[] {
    let matching = queryMatching(query);
    return scene.getNodes().filter(matching);
}

export function querySelectorNode(scene: IModelContainer, query: string): Nullable<BabylonNode> {
    let matching = queryMatching(query);
    for (let n of scene.getNodes()) {
        if (matching(n)) return n;
    }
    return null;
}
