import { Tags } from "@babylonjs/core/Misc/tags";
import { Scene } from "@babylonjs/core/scene";
import { Node } from "@babylonjs/core/node";
import { Nullable } from "@babylonjs/core/types";

function queryMatching(query: string) {
    if (query.at(0) == "#") {
        const byid = query.substring(1);
        return (n: Node) => n.id == byid;
    } else {
        return (n: Node) => Tags.MatchesQuery(n, query);
    }
}

export function querySelectorNodes(scene: Scene, query: string): Node[] {
    let matching = queryMatching(query);
    return scene.getNodes().filter(matching);
}

export function querySelectorNode(scene: Scene, query: string): Nullable<Node> {
    let matching = queryMatching(query);
    for (let n of scene.getNodes()) {
        if (matching(n)) return n;
    }
    return null;
}
