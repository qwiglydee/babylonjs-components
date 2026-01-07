import { expect, test } from "@playwright/test";

import type { Node as BabylonNode } from "@babylonjs/core/node";
import type { TestSomethingElem, TestSomesyncElem } from "../../src/testing";

import { loadBabylonHeadless, pickComponent } from "../testpage";

test.describe("lifecycle", () => {
    test("static creating", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-something></test-something>`);
        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        expect(await scene.evaluate((_) => _.rootNodes.length)).toBe(1);
        expect(await scene.evaluate((_, inst) => _.rootNodes[0] === inst, inst)).toBe(true);
    });

    test("dynamic creating", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, "");

        await babylon.evaluate((_) => _.appendChild(_.ownerDocument.createElement("test-something")));

        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        expect(await scene.evaluate((_) => _.rootNodes.length)).toBe(1);
        expect(await scene.evaluate((_, inst) => _.rootNodes[0] === inst, inst)).toBe(true);
    });

    test("deleting", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-something></test-something>`);
        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        await babylon.evaluate((_) => _.removeChild(_.querySelector("test-something")!));

        expect(await scene.evaluate((_) => _.rootNodes.length)).toBe(0);
        expect(await inst!.evaluate((_) => _.isDisposed())).toBe(true);
    });
});

test.describe("write/only prop", () => {
    test("static default", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-something></test-something>`);
        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        expect(await inst!.evaluate((_) => _.name)).toBe("something");
        await expect(ref).toHaveJSProperty("name", "something");
        await expect(ref).not.toHaveAttribute("name");
    });

    test("static attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-something name="foo"></test-something>`);
        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        expect(await inst!.evaluate((_) => _.name)).toBe("foo");
        await expect(ref).toHaveJSProperty("name", "foo");
        await expect(ref).toHaveAttribute("name", "foo");
    });

    test("dynamic default", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, "");

        await babylon.evaluate((_) => {
            const elem = _.ownerDocument.createElement("test-something");
            _.appendChild(elem);
        });

        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        expect(await inst!.evaluate((_) => _.name)).toBe("something");
        await expect(ref).toHaveJSProperty("name", "something");
        await expect(ref).not.toHaveAttribute("name");
    });

    test("dynamic attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, "");

        await babylon.evaluate((_) => {
            const elem = _.ownerDocument.createElement("test-something");
            elem.setAttribute("name", "foo");
            _.appendChild(elem);
        });

        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        expect(await inst!.evaluate((_) => _.name)).toBe("foo");
        await expect(ref).toHaveJSProperty("name", "foo");
        await expect(ref).toHaveAttribute("name", "foo");
    });

    test("dynamic prop", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, "");

        await babylon.evaluate((_) => {
            const elem = _.ownerDocument.createElement("test-something") as TestSomethingElem;
            elem.name = "foo";
            _.appendChild(elem);
        });

        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        expect(await inst!.evaluate((_) => _.name)).toBe("foo");
        await expect(ref).toHaveJSProperty("name", "foo");
        await expect(ref).not.toHaveAttribute("name"); // because initial builtin update/sync skipped 
    });

    test("changing attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-something name="foo"></test-something>`);
        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        await elem.evaluate((_) => _.setAttribute("name", "bar"));

        expect(await inst!.evaluate((_) => _.name)).toBe("bar");
        await expect(ref).toHaveJSProperty("name", "bar");
        await expect(ref).toHaveAttribute("name", "bar");
    });

    test("changing prop", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-something name="foo"></test-something>`);
        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        await elem.evaluate((_) => (_.name = "bar"));

        expect(await inst!.evaluate((_) => _.name)).toBe("bar");
        await expect(ref).toHaveJSProperty("name", "bar");
        await expect(ref).toHaveAttribute("name", "bar");
    });

    test("no sync with babylon", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-something></test-something>`);
        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        await inst!.evaluate((_) => (_.name = "foo"));

        expect(await inst!.evaluate((_) => _.name)).toBe("foo");
        await expect(ref).toHaveJSProperty("name", "something");
        await expect(ref).not.toHaveAttribute("name");
    });

    test("deleting attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-something name="foo"></test-something>`);
        const { ref, elem, inst } = await pickComponent<TestSomethingElem, BabylonNode>(page, "test-something", "_node");

        await elem.evaluate((_) => _.removeAttribute("name"));

        expect(await inst!.evaluate((_) => _.name)).toBe("something");
        await expect(ref).toHaveJSProperty("name", "something");
        await expect(ref).not.toHaveAttribute("name");
    });
});

test.describe("read/write prop", () => {
    test("static default", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-somesync></test-somesync>`);
        const { ref, elem, inst } = await pickComponent<TestSomesyncElem, BabylonNode>(page, "test-somesync", "_node");

        expect(await inst!.evaluate((_) => _.name)).toBe("something");
        await expect(ref).toHaveJSProperty("name", "something");
        await expect(ref).not.toHaveAttribute("name");
    });

    test("static attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-somesync name="foo"></test-somesync>`);
        const { ref, elem, inst } = await pickComponent<TestSomesyncElem, BabylonNode>(page, "test-somesync", "_node");

        expect(await inst!.evaluate((_) => _.name)).toBe("foo");
        await expect(ref).toHaveJSProperty("name", "foo");
        await expect(ref).toHaveAttribute("name", "foo");
    });

    test("dynamic default", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, "");

        await babylon.evaluate((_) => {
            const elem = _.ownerDocument.createElement("test-somesync");
            _.appendChild(elem);
        });

        const { ref, elem, inst } = await pickComponent<TestSomesyncElem, BabylonNode>(page, "test-somesync", "_node");

        expect(await inst!.evaluate((_) => _.name)).toBe("something");
        await expect(ref).toHaveJSProperty("name", "something");
        await expect(ref).not.toHaveAttribute("name");
    });

    test("dynamic attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, "");

        await babylon.evaluate((_) => {
            const elem = _.ownerDocument.createElement("test-somesync");
            elem.setAttribute("name", "foo");
            _.appendChild(elem);
        });

        const { ref, elem, inst } = await pickComponent<TestSomesyncElem, BabylonNode>(page, "test-somesync", "_node");

        expect(await inst!.evaluate((_) => _.name)).toBe("foo");
        await expect(ref).toHaveJSProperty("name", "foo");
        await expect(ref).toHaveAttribute("name", "foo");
    });

    test("dynamic prop", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, "");

        await babylon.evaluate((_) => {
            const elem = _.ownerDocument.createElement("test-somesync") as TestSomesyncElem;
            elem.name = "foo";
            _.appendChild(elem);
        });

        const { ref, elem, inst } = await pickComponent<TestSomesyncElem, BabylonNode>(page, "test-somesync", "_node");

        expect(await inst!.evaluate((_) => _.name)).toBe("foo");
        await expect(ref).toHaveJSProperty("name", "foo");
        await expect(ref).not.toHaveAttribute("name");
    });

    test("changing attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-somesync name="foo"></test-somesync>`);
        const { ref, elem, inst } = await pickComponent<TestSomesyncElem, BabylonNode>(page, "test-somesync", "_node");

        await elem.evaluate((_) => _.setAttribute("name", "bar"));

        expect(await inst!.evaluate((_) => _.name)).toBe("bar");
        await expect(ref).toHaveJSProperty("name", "bar");
        await expect(ref).toHaveAttribute("name", "bar");
    });

    test("changing prop", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-somesync name="foo"></test-somesync>`);
        const { ref, elem, inst } = await pickComponent<TestSomesyncElem, BabylonNode>(page, "test-somesync", "_node");

        await elem.evaluate((_) => (_.name = "bar"));

        expect(await inst!.evaluate((_) => _.name)).toBe("bar");
        await expect(ref).toHaveJSProperty("name", "bar");
        await expect(ref).toHaveAttribute("name", "bar");
    });

    test("sync with babylon", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-somesync></test-somesync>`);
        const { ref, elem, inst } = await pickComponent<TestSomesyncElem, BabylonNode>(page, "test-somesync", "_node");

        await inst!.evaluate((_) => (_.name = "foo"));

        expect(await inst!.evaluate((_) => _.name)).toBe("foo");
        await expect(ref).toHaveJSProperty("name", "foo");
        await expect(ref).not.toHaveAttribute("name");
    });

    test("deleting attr", async ({ page }) => {
        const { babylon, scene } = await loadBabylonHeadless(page, `<test-somesync name="foo"></test-somesync>`);
        const { ref, elem, inst } = await pickComponent<TestSomesyncElem, BabylonNode>(page, "test-somesync", "_node");

        await elem.evaluate((_) => _.removeAttribute("name"));

        expect(await inst!.evaluate((_) => _.name)).toBe("something");
        await expect(ref).toHaveJSProperty("name", "something");
        await expect(ref).toHaveAttribute("name", "something");
    });
});
