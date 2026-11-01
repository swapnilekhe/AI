import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    areAllSelected,
    buildHydrateFetchXml,
    buildSearchFetchXml,
    DEFAULT_DELIMITER,
    escapeFetchXmlValue,
    filterOptions,
    isGuid,
    isSelected,
    normalizeDelimiter,
    normalizeId,
    parseDelimitedIds,
    resolveEntitySetName,
    retainSelection,
    serializeIds,
    toOptions,
    toggleSelection
} from "../MultiSelectLookup/multiSelectLookupUtils.ts";
import type { IMultiSelectLookupOption } from "../MultiSelectLookup/IMultiSelectLookupOption.ts";

const GUID_A = "3a1b7c22-9f1e-4d3a-8c1a-000000000001";
const GUID_B = "3a1b7c22-9f1e-4d3a-8c1a-000000000002";
const GUID_C = "3a1b7c22-9f1e-4d3a-8c1a-000000000003";

function option(id: string, name: string): IMultiSelectLookupOption {
    return { id, name, primaryName: name };
}

describe("multiSelectLookupUtils - id handling", () => {
    it("parses an empty or missing value into no ids", () => {
        assert.deepEqual(parseDelimitedIds(undefined), []);
        assert.deepEqual(parseDelimitedIds(""), []);
        assert.deepEqual(parseDelimitedIds(";"), []);
    });

    it("parses a delimited list, trimming whitespace", () => {
        assert.deepEqual(parseDelimitedIds(` ${GUID_A} ; ${GUID_B} `), [GUID_A, GUID_B]);
    });

    it("strips the braces Dataverse wraps guid columns in", () => {
        assert.deepEqual(parseDelimitedIds(`{${GUID_A}};{${GUID_B}}`), [GUID_A, GUID_B]);
        assert.deepEqual(parseDelimitedIds(`(${GUID_A})`), [GUID_A]);
    });

    it("de-duplicates ids regardless of case", () => {
        assert.deepEqual(parseDelimitedIds(`${GUID_A};${GUID_A.toUpperCase()}`), [GUID_A]);
    });

    it("honours a custom delimiter", () => {
        assert.deepEqual(parseDelimitedIds(`${GUID_A}|${GUID_B}`, "|"), [GUID_A, GUID_B]);
    });

    it("falls back to the default delimiter for blank configuration", () => {
        assert.equal(normalizeDelimiter(undefined), DEFAULT_DELIMITER);
        assert.equal(normalizeDelimiter(""), DEFAULT_DELIMITER);
        assert.equal(normalizeDelimiter("   "), DEFAULT_DELIMITER);
        assert.equal(normalizeDelimiter("||"), "|");
    });

    it("round trips through serializeIds", () => {
        const ids = [GUID_A, GUID_B, GUID_C];
        assert.deepEqual(parseDelimitedIds(serializeIds(ids)), ids);
        assert.equal(serializeIds([]), "");
    });

    it("normalises and validates guids", () => {
        assert.equal(normalizeId(` {${GUID_A}} `), GUID_A);
        assert.equal(normalizeId(undefined), "");
        assert.equal(isGuid(GUID_A), true);
        assert.equal(isGuid(`{${GUID_A}}`), true);
        assert.equal(isGuid("not-a-guid"), false);
        assert.equal(isGuid(undefined), false);
    });
});

describe("multiSelectLookupUtils - fetchxml", () => {
    it("escapes xml special characters in search values", () => {
        assert.equal(escapeFetchXmlValue(`O'Reilly & <Sons>`), "O&apos;Reilly &amp; &lt;Sons&gt;");
    });

    it("builds a search query with a like filter and limit", () => {
        const xml = buildSearchFetchXml({
            entityName: "account",
            displayAttribute: "name",
            idAttribute: "accountid",
            primaryNameAttribute: "name",
            searchText: "cont",
            top: 25
        });

        assert.ok(xml.includes('<entity name="account">'));
        assert.ok(xml.includes('operator="like" value="%cont%"'));
        assert.ok(xml.includes("<limit><value>25</value></limit>"));
        // the display attribute and the id attribute are each projected once
        assert.equal((xml.match(/name="name" \/>/g) || []).length, 1);
    });

    it("omits the filter when there is no search text", () => {
        const xml = buildSearchFetchXml({
            entityName: "account",
            displayAttribute: "name",
            idAttribute: "accountid",
            top: 10
        });

        assert.ok(!xml.includes("<filter"));
    });

    it("escapes a search value that contains an xml metacharacter", () => {
        const xml = buildSearchFetchXml({
            entityName: "account",
            displayAttribute: "name",
            idAttribute: "accountid",
            searchText: "A&B"
        });

        assert.ok(xml.includes('value="%A&amp;B%"'));
    });

    it("builds an in clause for hydration and ignores search text", () => {
        const xml = buildHydrateFetchXml({
            entityName: "contact",
            displayAttribute: "fullname",
            idAttribute: "contactid",
            ids: [GUID_A, GUID_B],
            searchText: "should be ignored",
            top: 50
        });

        assert.ok(xml.includes('operator="in"'));
        assert.ok(xml.includes(`<value>${GUID_A}</value>`));
        assert.ok(xml.includes(`<value>${GUID_B}</value>`));
        assert.ok(!xml.includes("like"));
    });

describe("multiSelectLookupUtils - entity set resolution", () => {
    it("prefers the explicit override", () => {
        assert.equal(resolveEntitySetName("account", "accounts"), "accounts");
    });

    it("uses the form context metadata when available", () => {
        assert.equal(
            resolveEntitySetName("account", undefined, { EntitySetName: "accounts", EntitySetNamePlural: "accounts" }),
            "accounts"
        );
        assert.equal(resolveEntitySetName("account", undefined, { EntitySetNamePlural: "accounts" }), "accounts");
    });

    it("pluralises as a last resort", () => {
        assert.equal(resolveEntitySetName("account", undefined), "accounts");
        assert.equal(resolveEntitySetName("business", undefined), "businesses");
        assert.equal(resolveEntitySetName("", undefined), "");
    });
});

describe("multiSelectLookupUtils - option projection", () => {
    it("projects records onto options", () => {
        const options = toOptions([{ name: "Fabrikam", accountid: GUID_A }], "accountid", "name", "name");
        assert.deepEqual(options, [{ id: GUID_A, name: "Fabrikam", primaryName: "Fabrikam" }]);
    });

    it("de-duplicates and skips records without an id", () => {
        const options = toOptions(
            [
                { name: "One", accountid: GUID_A },
                { name: "One again", accountid: GUID_A },
                { name: "No id", accountid: null },
                { name: "Two", accountid: GUID_B }
            ],
            "accountid",
            "name",
            "name"
        );

        assert.deepEqual(
            options.map((o) => o.id),
            [GUID_A, GUID_B]
        );
    });

    it("falls back through display attribute to primary name to id", () => {
        assert.equal(toOptions([{ accountid: GUID_A }], "accountid", "name", "name")[0].name, GUID_A);
        assert.equal(toOptions([{ accountid: GUID_A, fullname: "Ada" }], "accountid", "fullname", "name")[0].name, "Ada");
    });

    it("returns an empty array for no records", () => {
        assert.deepEqual(toOptions(undefined, "accountid", "name", "name"), []);
        assert.deepEqual(toOptions([], "accountid", "name", "name"), []);
    });
});

describe("multiSelectLookupUtils - filtering", () => {
    const all = [option(GUID_A, "Fabrikam"), option(GUID_B, "Contoso"), option(GUID_C, "Adventure Works")];

    it("returns everything for an empty search", () => {
        assert.deepEqual(filterOptions(all, ""), all);
        assert.deepEqual(filterOptions(all, "   "), all);
    });

    it("matches on a case insensitive substring of the name", () => {
        assert.deepEqual(
            filterOptions(all, "CONT").map((o) => o.id),
            [GUID_B]
        );
    });

    it("matches on the id as well as the name", () => {
        // the tail of the guid is unique to the third fixture
        assert.deepEqual(
            filterOptions(all, GUID_C.slice(-6)).map((o) => o.id),
            [GUID_C]
        );
    });

    it("always keeps selected options so they can be deselected", () => {
        const filtered = filterOptions(all, "fabri", [GUID_C]);
        assert.deepEqual(
            filtered.map((o) => o.id),
            [GUID_A, GUID_C]
        );
    });

    it("respects the top limit", () => {
        assert.equal(filterOptions(all, "", [], 2).length, 2);
    });
});

describe("multiSelectLookupUtils - selection", () => {
    const a = option(GUID_A, "Fabrikam");
    const b = option(GUID_B, "Contoso");
    const c = option(GUID_C, "Adventure Works");

    it("adds an option that is not selected", () => {
        const selected = toggleSelection([a], b);
        assert.deepEqual(selected, [a, b]);
        assert.equal(isSelected(selected, b), true);
    });

    it("removes an option that is already selected", () => {
        assert.deepEqual(toggleSelection([a, b], a), [b]);
    });

    it("matches ids case insensitively and does not mutate the input", () => {
        const selected = [a];
        const result = toggleSelection(selected, option(GUID_A.toUpperCase(), "Fabrikam"));
        assert.deepEqual(result, []);
        assert.deepEqual(selected, [a]);
    });

    it("reports whether every candidate is selected", () => {
        assert.equal(areAllSelected([a, b, c], [a, b]), true);
        assert.equal(areAllSelected([a], [a, b]), false);
        assert.equal(areAllSelected([a], []), false);
    });

    it("drops selections that are no longer present in the option list", () => {
        assert.deepEqual(retainSelection([a, b, c], [a, c]), [a, c]);
    });
});


    it("falls back to a sane limit for invalid top values", () => {
        const xml = buildSearchFetchXml({
            entityName: "account",
            displayAttribute: "name",
            idAttribute: "accountid",
            top: 0
        });

        assert.ok(xml.includes("<limit><value>100</value></limit>"));
    });
});
