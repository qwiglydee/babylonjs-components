import { expect, test } from "@playwright/test";

import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { TestNodeElem } from "../../src/testing";

import { pickComponent, loadBabylonHeadless } from "../testpage";

test("id and tags", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadless(page, `<test-node id="foo" class="bar baz"></test-node>`);
    const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

    expect(await inst!.evaluate((_) => _.id)).toEqual("foo");
    expect(await scene.evaluate((_) => _.getTransformNodesByTags("bar && baz").map((n) => n.id))).toEqual(["foo"]);
    await expect(ref).toHaveJSProperty("id", "foo");
});

test.describe("lifecycle", () => {
    test("static creating", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-node></test-node>`);
        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        expect(await scene.evaluate((_) => _.transformNodes.length)).toBe(1);
        expect(await scene.evaluate((_, inst) => _.transformNodes[0] === inst, inst)).toBe(true);
    });

    test("dynamic creating", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, "");

        await babylon.evaluate((_) => _.appendChild(_.ownerDocument.createElement("test-node")));

        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        expect(await scene.evaluate((_) => _.transformNodes.length)).toBe(1);
        expect(await scene.evaluate((_, inst) => _.transformNodes[0] === inst, inst)).toBe(true);
    });

    test("deleting", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-node></test-node>`);
        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        await babylon.evaluate((_) => _.removeChild(_.querySelector("test-node")!));

        expect(await scene.evaluate((_) => _.transformNodes.length)).toBe(0);
        expect(await inst!.evaluate((_) => _.isDisposed())).toBe(true);
    });
});



test.describe("enabling", () => {
    test("default enabled", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-node></test-node>`);
        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        await expect(ref).toHaveJSProperty("disabled", false);
        await expect(ref).toHaveJSProperty("enabled", true);
    });

    test("disabled attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-node disabled></test-node>`);
        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        await expect(ref).toHaveJSProperty("disabled", true);
        await expect(ref).toHaveJSProperty("enabled", false);
    });

    test("toggle enabled prop", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-node></test-node>`);
        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        await elem.evaluate((_) => (_.enabled = false));

        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        await expect(ref).toHaveJSProperty("disabled", true);
        await expect(ref).toHaveJSProperty("enabled", false);

        await elem.evaluate((_) => (_.enabled = true));

        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        await expect(ref).toHaveJSProperty("disabled", false);
        await expect(ref).toHaveJSProperty("enabled", true);
    });

    test("toggle enabled babylon", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-node></test-node>`);
        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        await inst!.evaluate((_) => _.setEnabled(false));

        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        await expect(ref).toHaveJSProperty("disabled", true);
        await expect(ref).toHaveJSProperty("enabled", false);

        await inst!.evaluate((_) => _.setEnabled(true));

        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        await expect(ref).toHaveJSProperty("disabled", false);
        await expect(ref).toHaveJSProperty("enabled", true);
    });
});

test.describe("visibility", () => {
    test("default visible", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-node></test-node>`);
        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        expect(await inst!.evaluate((_) => _.isVisible)).toEqual(true);
        await expect(ref).toHaveJSProperty("hidden", false);
        await expect(ref).toHaveJSProperty("visible", true);
    });

    test("init hidden attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-node hidden></test-node>`);
        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        expect(await inst!.evaluate((_) => _.isVisible)).toEqual(false);
        await expect(ref).toHaveJSProperty("hidden", true);
        await expect(ref).toHaveJSProperty("visible", false);
    });

    test("toggle visible prop", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-node></test-node>`);
        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        await elem.evaluate((_) => (_.visible = false));

        expect(await inst!.evaluate((_) => _.isVisible)).toEqual(false);
        await expect(ref).toHaveJSProperty("hidden", true);
        await expect(ref).toHaveJSProperty("visible", false);

        await elem.evaluate((_) => (_.visible = true));

        expect(await inst!.evaluate((_) => _.isVisible)).toEqual(true);
        await expect(ref).toHaveJSProperty("hidden", false);
        await expect(ref).toHaveJSProperty("visible", true);
    });

    test("toggle visible babylon", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-node></test-node>`);
        const { ref, elem, inst } = await pickComponent<TestNodeElem, TransformNode>(page, "test-node", "_node");

        await inst!.evaluate((_) => (_.isVisible = false));

        expect(await inst!.evaluate((_) => _.isVisible)).toEqual(false);
        await expect(ref).toHaveJSProperty("hidden", true);
        await expect(ref).toHaveJSProperty("visible", false);

        await inst!.evaluate((_) => (_.isVisible = true));

        expect(await inst!.evaluate((_) => _.isVisible)).toEqual(true);
        await expect(ref).toHaveJSProperty("hidden", false);
        await expect(ref).toHaveJSProperty("visible", true);
    });
});
