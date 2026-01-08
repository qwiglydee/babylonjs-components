import { expect, test } from "@playwright/test";

import type { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import type { TestCameraElem } from "../../src/testing";

import { pickComponent, loadBabylonHeadless } from "../testpage";

test.describe("primary props", () => {
    test("id", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-camera id="foo"></test-camera>`);
        const { ref, elem, inst } = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera", "_camera");

        expect(await elem.evaluate((_) => _.id)).toEqual("foo");
        expect(await elem.evaluate((_) => _.name)).toEqual("somecam");
        expect(await scene.evaluate((_, inst) => _.getCameraById("foo") === inst, inst)).toBe(true);
    });

    test("name", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-camera name="foocam"></test-camera>`);
        const { ref, elem, inst } = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera", "_camera");

        expect(await elem.evaluate((_) => _.id)).toEqual("");
        expect(await elem.evaluate((_) => _.name)).toEqual("foocam");
        expect(await scene.evaluate((_, inst) => _.getCameraByName("foocam") === inst, inst)).toBe(true);
    });

    test("tags", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-camera class="bar baz"></test-camera>`);
        const { ref, elem, inst } = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera", "_camera");

        expect(await elem.evaluate((_) => _.id)).toEqual("");
        expect(await elem.evaluate((_) => _.name)).toEqual("somecam");
        expect(await scene.evaluate((_, inst) => _.getCamerasByTags("bar && baz").includes(inst!), inst)).toBe(true);
    });
});

test.describe("lifecycle", () => {
    test("static creating", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-camera></test-camera>`);
        const { ref, elem, inst } = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera", "_camera");

        expect(await scene.evaluate((_) => _.cameras.length)).toBe(1);
        expect(await scene.evaluate((_, inst) => _.cameras[0] === inst, inst)).toBe(true);
    });

    test("dynamic creating", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, "");

        await babylon.evaluate((_) => _.appendChild(_.ownerDocument.createElement("test-camera")));

        const { ref, elem, inst } = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera", "_camera");

        expect(await scene.evaluate((_) => _.cameras.length)).toBe(1);
        expect(await scene.evaluate((_, inst) => _.cameras[0] === inst, inst)).toBe(true);
    });

    test("deleting", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-camera></test-camera>`);
        const { ref, elem, inst } = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera", "_camera");

        await babylon.evaluate((_) => _.removeChild(_.querySelector("test-camera")!));

        expect(await scene.evaluate((_) => _.cameras.length)).toBe(0);
        expect(await inst!.evaluate((_) => _.isDisposed())).toBe(true);
    });
});

test.describe("activating", () => {
    test("default inactive", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-camera></test-camera>`);
        const { ref, elem, inst } = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera", "_camera");

        expect(await scene.evaluate((_) => _.cameras.length)).toBe(1);
        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        expect(await inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(false);
        await expect(ref).toHaveJSProperty("disabled", true);
        await expect(ref).toHaveJSProperty("enabled", false);
        await expect(ref).toHaveAttribute("disabled");
        await expect(ref).not.toHaveAttribute("selected");
    });

    test("init active", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-camera selected></test-camera>`);
        const { ref, elem, inst } = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera", "_camera");

        expect(await scene.evaluate((_) => _.cameras.length)).toBe(1);
        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        expect(await inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(true);
        await expect(ref).toHaveJSProperty("disabled", false);
        await expect(ref).toHaveJSProperty("enabled", true);
        await expect(ref).not.toHaveAttribute("disabled");
        await expect(ref).toHaveAttribute("selected");
    });

    test("set active", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-camera></test-camera>`);
        const { ref, elem, inst } = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera", "_camera");

        await elem.evaluate((_) => (_.selected = true));

        expect(await scene.evaluate((_) => _.cameras.length)).toBe(1);
        expect(await inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        expect(await inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(true);
        await expect(ref).toHaveJSProperty("disabled", false);
        await expect(ref).toHaveJSProperty("enabled", true);
        await expect(ref).not.toHaveAttribute("disabled");
        await expect(ref).toHaveAttribute("selected");
    });

    test("switching via prop", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(
            page,
            `
            <test-camera id="foo"></test-camera>
            <test-camera id="bar" selected></test-camera>
        `
        );
        const foo = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera#foo", "_camera");
        const bar = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera#bar", "_camera");

        expect(await scene.evaluate((_) => _.cameras.length)).toBe(2);
        expect(await foo.inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        expect(await foo.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(false);
        await expect(foo.ref).toHaveAttribute("disabled");
        await expect(foo.ref).not.toHaveAttribute("selected");
        expect(await bar.inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        expect(await bar.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(true);
        await expect(bar.ref).not.toHaveAttribute("disabled");
        await expect(bar.ref).toHaveAttribute("selected");

        await foo.elem.evaluate((_) => (_.selected = true));

        expect(await foo.inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        expect(await foo.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(true);
        await expect(foo.ref).not.toHaveAttribute("disabled");
        await expect(foo.ref).toHaveAttribute("selected");
        expect(await bar.inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        expect(await bar.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(false);
        await expect(bar.ref).toHaveAttribute("disabled");
        await expect(bar.ref).not.toHaveAttribute("selected");

        await bar.elem.evaluate((_) => (_.selected = true));

        expect(await foo.inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        expect(await foo.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(false);
        await expect(foo.ref).toHaveAttribute("disabled");
        await expect(foo.ref).not.toHaveAttribute("selected");
        expect(await bar.inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        expect(await bar.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(true);
        await expect(bar.ref).not.toHaveAttribute("disabled");
        await expect(bar.ref).toHaveAttribute("selected");
    });

    test("switching by babylon", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(
            page,
            `
            <test-camera id="foo"></test-camera>
            <test-camera id="bar" selected></test-camera>
        `
        );
        const foo = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera#foo", "_camera");
        const bar = await pickComponent<TestCameraElem, FreeCamera>(page, "test-camera#bar", "_camera");

        expect(await scene.evaluate((_) => _.cameras.length)).toBe(2);
        expect(await foo.inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        expect(await foo.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(false);
        await expect(foo.ref).toHaveAttribute("disabled");
        await expect(foo.ref).not.toHaveAttribute("selected");
        expect(await bar.inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        expect(await bar.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(true);
        await expect(bar.ref).not.toHaveAttribute("disabled");
        await expect(bar.ref).toHaveAttribute("selected");

        await scene.evaluate((_) => _.setActiveCameraById("foo"));

        expect(await foo.inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        expect(await foo.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(true);
        await expect(foo.ref).not.toHaveAttribute("disabled");
        await expect(foo.ref).toHaveAttribute("selected");
        expect(await bar.inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        expect(await bar.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(false);
        await expect(bar.ref).toHaveAttribute("disabled");
        await expect(bar.ref).not.toHaveAttribute("selected");

        await scene.evaluate((_) => _.setActiveCameraById("bar"));

        expect(await foo.inst!.evaluate((_) => _.isEnabled())).toEqual(false);
        expect(await foo.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(false);
        await expect(foo.ref).toHaveAttribute("disabled");
        await expect(foo.ref).not.toHaveAttribute("selected");
        expect(await bar.inst!.evaluate((_) => _.isEnabled())).toEqual(true);
        expect(await bar.inst!.evaluate((_) => _.inputs.attachedToElement)).toEqual(true);
        await expect(bar.ref).not.toHaveAttribute("disabled");
        await expect(bar.ref).toHaveAttribute("selected");
    });
});
