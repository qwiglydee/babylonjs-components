import { expect, test } from "@playwright/test";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";

import { MyAnchorElem } from "../../src/my/elements/anchor";

import { pickComponent } from "../testpage";
import { loadBabylonHeadful } from "../mypage";

test("static creation", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(page, `<b3d-anchor></b3d-anchor>`);
    const { ref, elem, inst } = await pickComponent<MyAnchorElem, TransformNode>(page, "b3d-anchor", "_node");

    expect(await scene.evaluate((_) => _.transformNodes.length)).toBe(1);
    expect(await scene.evaluate((_, inst) => _.transformNodes[0] === inst, inst)).toBe(true);
    
    expect(await inst!.evaluate((_) => _.getAbsolutePosition().toString())).toEqual("{X: 0 Y: 0 Z: 0}");
    expect(await elem.evaluate((_) => _.position)).toEqual({ x: 0, y: 0, z: 0 });
});

test("dynamic creation", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(page, "");

    await babylon.evaluate((_) => {
        const elem = _.ownerDocument.createElement("b3d-anchor");
        _.appendChild(elem);
    });

    const { ref, elem, inst } = await pickComponent<MyAnchorElem, TransformNode>(page, "b3d-anchor", "_node");

    expect(await scene.evaluate((_) => _.transformNodes.length)).toBe(1);
    expect(await scene.evaluate((_, inst) => _.transformNodes[0] === inst, inst)).toBe(true);

    expect(await inst!.evaluate((_) => _.getAbsolutePosition().toString())).toEqual("{X: 0 Y: 0 Z: 0}");
    expect(await elem.evaluate((_) => _.position)).toEqual({ x: 0, y: 0, z: 0 });
});

test("static attr", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(page, `<b3d-anchor position="[1, 2, 3]"></b3d-anchor>`);
    const { ref, elem, inst } = await pickComponent<MyAnchorElem, TransformNode>(page, "b3d-anchor", "_node");

    expect(await inst!.evaluate((_) => _.getAbsolutePosition().toString())).toEqual("{X: 1 Y: 2 Z: 3}");
    expect(await elem.evaluate((_) => _.position)).toEqual({ x: 1, y: 2, z: 3 });
});


test("dynamic attr", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(page, "");

    await babylon.evaluate((_) => {
        const elem = _.ownerDocument.createElement("b3d-anchor");
        elem.setAttribute("position", "[1, 2, 3]");
        _.appendChild(elem);
    });

    const { ref, elem, inst } = await pickComponent<MyAnchorElem, TransformNode>(page, "b3d-anchor", "_node");

    expect(await inst!.evaluate((_) => _.getAbsolutePosition().toString())).toEqual("{X: 1 Y: 2 Z: 3}");
    expect(await elem.evaluate((_) => _.position)).toEqual({ x: 1, y: 2, z: 3 });
});

test("dynamic prop", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(page, "");

    await babylon.evaluate((_) => {
        const elem = _.ownerDocument.createElement("b3d-anchor") as MyAnchorElem;
        elem.position = { x: 1, y: 2, z: 3 };
        _.appendChild(elem);
    });

    const { ref, elem, inst } = await pickComponent<MyAnchorElem, TransformNode>(page, "b3d-anchor", "_node");

    expect(await inst!.evaluate((_) => _.getAbsolutePosition().toString())).toEqual("{X: 1 Y: 2 Z: 3}");
    expect(await elem.evaluate((_) => _.position)).toEqual({ x: 1, y: 2, z: 3 });
});

test("changing prop", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(page, `<b3d-anchor></b3d-anchor>`);
    const { ref, elem, inst } = await pickComponent<MyAnchorElem, TransformNode>(page, "b3d-anchor", "_node");

    await elem.evaluate((_) => {
        _.position = { x: 1, y: 2, z: 3 };
    });

    expect(await inst!.evaluate((_) => _.getAbsolutePosition().toString())).toEqual("{X: 1 Y: 2 Z: 3}");
    expect(await elem.evaluate((_) => _.position)).toEqual({ x: 1, y: 2, z: 3 });
});

test("changing value", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(page, `<b3d-anchor></b3d-anchor>`);
    const { ref, elem, inst } = await pickComponent<MyAnchorElem, TransformNode>(page, "b3d-anchor", "_node");

    await inst!.evaluate((_) => {
        _.position.x = 1;
        _.position.y = 2;
        _.position.z = 3;
        _.computeWorldMatrix(true);
    });

    expect(await inst!.evaluate((_) => _.getAbsolutePosition().toString())).toEqual("{X: 1 Y: 2 Z: 3}");
    expect(await elem.evaluate((_) => _.position)).toEqual({ x: 1, y: 2, z: 3 });
});
