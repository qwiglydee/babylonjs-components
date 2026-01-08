import { expect, test } from "@playwright/test";

import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { TestMeshElem } from "../../src/testing";

import { pickComponent, loadBabylonHeadless } from "../testpage";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";


test.describe("primary props", () => {
    test('id', async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh id="foo"></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, AbstractMesh>(page, "test-mesh", "_node");
        
        expect(await elem.evaluate(_ => _.id)).toEqual('foo');
        expect(await elem.evaluate(_ => _.name)).toEqual('something');
        expect(await scene.evaluate((_, inst) => _.getMeshById("foo") === inst, inst)).toBe(true);
    });

    test('name', async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh name="foothing"></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, AbstractMesh>(page, "test-mesh", "_node");
        
        expect(await elem.evaluate(_ => _.id)).toEqual("");
        expect(await elem.evaluate(_ => _.name)).toEqual('foothing');
        expect(await scene.evaluate((_, inst) => _.getMeshByName("foothing") === inst, inst)).toBe(true);
    });

    test('tags', async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh class="bar baz"></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, AbstractMesh>(page, "test-mesh", "_node");
        
        expect(await elem.evaluate(_ => _.id)).toEqual("");
        expect(await elem.evaluate(_ => _.name)).toEqual('something');
        expect(await scene.evaluate((_, inst) => _.getMeshesByTags("bar && baz").includes(inst!), inst)).toBe(true);
    });
})


test.describe("lifecycle", () => {
    test("static creating", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

        expect(await scene.evaluate((_) => _.meshes.length)).toBe(1);
        expect(await scene.evaluate((_, inst) => _.meshes[0] === inst, inst)).toBe(true);
    });

    test("dynamic creating", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, "");

        await babylon.evaluate((_) => _.appendChild(_.ownerDocument.createElement("test-mesh")));

        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

        expect(await scene.evaluate((_) => _.meshes.length)).toBe(1);
        expect(await scene.evaluate((_, inst) => _.meshes[0] === inst, inst)).toBe(true);
    });

    test("deleting", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

        await babylon.evaluate((_) => _.removeChild(_.querySelector("test-mesh")!));

        expect(await scene.evaluate((_) => _.meshes.length)).toBe(0);
        expect(await inst!.evaluate((_) => _.isDisposed())).toBe(true);
    });
});

test.describe("enabling", () => {
    test("default enabled", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        await expect(ref).toHaveJSProperty("disabled", false);
        await expect(ref).toHaveJSProperty("enabled", true);
    });

    test("disabled attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh disabled></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        await expect(ref).toHaveJSProperty("disabled", true);
        await expect(ref).toHaveJSProperty("enabled", false);
    });

    test("toggle enabled prop", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

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
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

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
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

        expect(await inst!.evaluate((_) => _.isVisible)).toEqual(true);
        await expect(ref).toHaveJSProperty("hidden", false);
        await expect(ref).toHaveJSProperty("visible", true);
    });

    test("init hidden attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh hidden></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

        expect(await inst!.evaluate((_) => _.isVisible)).toEqual(false);
        await expect(ref).toHaveJSProperty("hidden", true);
        await expect(ref).toHaveJSProperty("visible", false);
    });

    test("toggle visible prop", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

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
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-mesh></test-mesh>`);
        const { ref, elem, inst } = await pickComponent<TestMeshElem, TransformNode>(page, "test-mesh", "_node");

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
