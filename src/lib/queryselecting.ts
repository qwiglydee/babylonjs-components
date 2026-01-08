import { Tags } from "@babylonjs/core/Misc/tags";
import type { Scene } from "@babylonjs/core/scene";
import type { Node as BabylonNode} from "@babylonjs/core/node";
import type { Nullable } from "@babylonjs/core/types";

function queryMatching(query: string) {
    if (query.at(0) == "#") {
        const byid = query.substring(1);
        return (n: BabylonNode) => n.id == byid;
    } else {
        return (n: BabylonNode) => Tags.MatchesQuery(n, query);
    }
}

export function querySelectorNodes(scene: Scene, query: string): BabylonNode[] {
    let matching = queryMatching(query);
    return scene.getNodes().filter(matching);
}

export function querySelectorNode(scene: Scene, query: string): Nullable<BabylonNode> {
    let matching = queryMatching(query);
    for (let n of scene.getNodes()) {
        if (matching(n)) return n;
    }
    return null;
}
