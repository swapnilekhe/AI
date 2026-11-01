import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MultiSelectLookupControl } from "../MultiSelectLookup/MultiSelectLookup.tsx";

const GUID_A = "3a1b7c22-9f1e-4d3a-8c1a-000000000001";
const GUID_B = "3a1b7c22-9f1e-4d3a-8c1a-000000000002";

/** Flattens the stub element tree into a single array of nodes. */
function walk(node: any, out: any[] = []): any[] {
    if (node === null || node === undefined || typeof node !== "object") {
        return out;
    }
    if (Array.isArray(node)) {
        node.forEach((child) => walk(child, out));
        return out;
    }
    out.push(node);
    walk(node.children, out);
    return out;
}

function byClass(tree: any, className: string): any[] {
    return walk(tree).filter(
        (node) =>
            typeof node.props?.className === "string" && node.props.className.split(" ").includes(className)
    );
}

function textsOf(nodes: any[]): string[] {
    const out: string[] = [];
    const collect = (node: any): void => {
        if (typeof node === "string") {
            out.push(node);
        } else if (Array.isArray(node)) {
            node.forEach(collect);
        } else if (node && typeof node === "object") {
            collect(node.children);
        }
    };
    nodes.forEach(collect);
    return out;
}

interface IHost {
    published: string[];
    requests: string[];
    control: MultiSelectLookupControl;
}

function createHost(parameters: any, records: any[]): IHost {
    const published: string[] = [];
    const requests: string[] = [];
    let guidCount = 0;

    const valueUpdater = {
        updateOutputValue: (value: any, success: (v?: any) => void): void => {
            published.push(value);
            success(value);
        },
        getValue: (): any => (published.length ? published[published.length - 1] : undefined)
    };

    const context = {
        parameters,
        factory: {
            createGuid: (): string => `guid-${++guidCount}`,
            getValueUpdater: (): any => valueUpdater,
            createClient: (): any => ({
                retrieveMultiple: (fetchXml: string): Promise<any[]> => {
                    requests.push(decodeURIComponent(fetchXml));
                    return Promise.resolve(records);
                }
            })
        }
    };

    const control = new MultiSelectLookupControl(undefined as any, context as any);
    control.init();
    return { published, requests, control };
}

const baseParameters = {
    entityName: "account",
    displayProperty: "name",
    primaryIdAttribute: "accountid",
    placeholderText: "Search accounts",
    labelText: "Accounts",
    selectedItemsDelimiter: ";",
    maxOptions: 100,
    allowSearch: true,
    showSelectAll: true,
    isDisabled: false,
    isRequired: false,
    defaultSelectedItems: ""
};

const settle = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe("MultiSelectLookupControl - rendering", () => {
    it("shows the placeholder and no tags when nothing is selected", () => {
        const { control } = createHost({ ...baseParameters }, []);
        const tree = control.render();

        assert.deepEqual(textsOf(byClass(tree, "msls-placeholder")), ["Search accounts"]);
        assert.equal(byClass(tree, "msls-tag").length, 0);
        assert.equal(byClass(tree, "msls-panel").length, 0);
    });

    it("renders the label only when label text is configured", () => {
        const withLabel = createHost({ ...baseParameters }, []).control.render();
        assert.equal(byClass(withLabel, "msls-label").length, 1);

        const withoutLabel = createHost({ ...baseParameters, labelText: "" }, []).control.render();
        assert.equal(byClass(withoutLabel, "msls-label").length, 0);
    });

    it("shows the required error when the field is empty", () => {
        const { control } = createHost({ ...baseParameters, isRequired: true }, []);
        const tree = control.render();

        assert.deepEqual(textsOf(byClass(tree, "msls-error")), ["This field is required."]);
        assert.equal(byClass(tree, "msls-inputContainer--error").length, 1);
    });

    it("marks the control as disabled and hides the tag remove buttons", () => {
        const { control } = createHost(
            { ...baseParameters, isDisabled: true, defaultSelectedItems: GUID_A },
            []
        );
        const tree = control.render();

        assert.equal(byClass(tree, "msls-inputContainer--disabled").length, 1);

describe("MultiSelectLookupControl - hydration", () => {
    it("resolves the stored ids into readable tags via FetchXML", async () => {
        const host = createHost({ ...baseParameters, defaultSelectedItems: `${GUID_A};${GUID_B}` }, [
            { name: "Fabrikam", accountid: GUID_A },
            { name: "Contoso", accountid: GUID_B }
        ]);

        // The host renders straight after init, which kicks off hydration.
        host.control.render();
        await settle();

        const tree = host.control.render();
        assert.deepEqual(textsOf(byClass(tree, "msls-tagLabel")).sort(), ["Contoso", "Fabrikam"]);

        assert.equal(host.requests.length, 1);
        assert.ok(host.requests[0].includes('operator="in"'));
        assert.ok(host.requests[0].includes(`<value>${GUID_A}</value>`));
        assert.ok(host.requests[0].includes(`<value>${GUID_B}</value>`));
    });

    it("keeps the raw id visible when the record cannot be resolved", async () => {
        const host = createHost({ ...baseParameters, defaultSelectedItems: GUID_A }, []);
        host.control.render();
        await settle();

        assert.deepEqual(textsOf(byClass(host.control.render(), "msls-tagLabel")), [GUID_A]);
    });

    it("re-publishes the ids unchanged after hydration", async () => {
        const host = createHost({ ...baseParameters, defaultSelectedItems: `${GUID_A};${GUID_B}` }, [
            { name: "Fabrikam", accountid: GUID_A }
        ]);
        host.control.render();
        await settle();

        assert.equal(host.published[host.published.length - 1], `${GUID_A};${GUID_B}`);
    });
});

describe("MultiSelectLookupControl - interaction", () => {
    async function openWithOptions(): Promise<IHost> {
        const host = createHost({ ...baseParameters }, [
            { name: "Fabrikam", accountid: GUID_A },
            { name: "Contoso", accountid: GUID_B }
        ]);
        host.control.render();
        await settle();

        byClass(host.control.render(), "msls-inputContainer")[0].props.onClick();
        await settle();

        return host;
    }

    it("loads the option list when the control is opened", async () => {
        const host = await openWithOptions();
        const options = byClass(host.control.render(), "msls-option");

        assert.equal(options.length, 2);
        assert.deepEqual(textsOf(options.map((o) => o.props.title)).sort(), ["Contoso", "Fabrikam"]);
    });

    it("publishes the selected ids when an option is clicked", async () => {
        const host = await openWithOptions();
        byClass(host.control.render(), "msls-option")[0].props.onClick();

        const value = host.published[host.published.length - 1];
        assert.ok(value === GUID_A || value === GUID_B);
        assert.equal(host.published[host.published.length - 1], value);
    });

    it("selects and then deselects the same option", async () => {
        const host = await openWithOptions();
        const option = byClass(host.control.render(), "msls-option")[0];

        option.props.onClick();
        const afterSelect = host.published[host.published.length - 1];
        assert.ok(afterSelect.length > 0);

        const refreshed = byClass(host.control.render(), "msls-option").find(
            (o) => o.props.title === option.props.title
        );
        refreshed.props.onClick();
        assert.equal(host.published[host.published.length - 1], "");
    });

    it("removes a tag through its remove button", async () => {
        const host = createHost({ ...baseParameters, defaultSelectedItems: `${GUID_A};${GUID_B}` }, []);
        host.control.render();
        await settle();

        byClass(host.control.render(), "msls-tagRemove")[0].props.onClick({
            stopPropagation: (): void => undefined
        });

        assert.equal(host.published[host.published.length - 1], GUID_B);
    });

    it("selects every visible record from the footer", async () => {
        const host = await openWithOptions();
        const selectAll = byClass(host.control.render(), "msls-footerButton").find(
            (b) => b.children[0] === "Select all"
        );
        selectAll.props.onClick();

        const value = host.published[host.published.length - 1];
        const ids = value.split(";");
        assert.equal(ids.length, 2);
        assert.ok(ids.includes(GUID_A) && ids.includes(GUID_B));
    });

    it("closes on outside click and stops loading options", async () => {
        const host = await openWithOptions();
        const before = host.requests.length;

        byClass(host.control.render(), "msls-inputContainer")[0].props.onClick();
        assert.equal(byClass(host.control.render(), "msls-panel").length, 0);
        assert.equal(host.requests.length, before);
    });
});

        assert.equal(byClass(tree, "msls-tagRemove").length, 0);
    });

    it("renders a tag per pre-selected id", () => {
        const { control } = createHost({ ...baseParameters, defaultSelectedItems: `${GUID_A};${GUID_B}` }, []);
        const tree = control.render();

        assert.equal(byClass(tree, "msls-tag").length, 2);
        assert.equal(byClass(tree, "msls-placeholder").length, 0);
    });
});
