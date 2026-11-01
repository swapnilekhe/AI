import type { IMultiSelectLookupOption } from "./IMultiSelectLookupOption";

/** Default character used to serialise the selected ids into the bound field. */
export const DEFAULT_DELIMITER = ";";

/** Default number of records fetched per request when the property is not set. */
export const DEFAULT_MAX_OPTIONS = 100;

/** Maximum number of ids Dataverse accepts in a single `in` condition. */
const MAX_IN_CLAUSE_SIZE = 1000;

const GUID_PATTERN = /^[{(]?[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}[)}]?$/;

export interface IFetchXmlOptions {
    entityName: string;
    displayAttribute: string;
    /** Primary id attribute, used to project and to build the `in` filter. */
    idAttribute: string;
    /** Table primary name attribute, projected as a fallback label. */
    primaryNameAttribute?: string;
    searchText?: string;
    /** When provided the fetch is restricted to these ids (no search filter). */
    ids?: string[];
    top?: number;
}

export interface IOptionSearchOptions {
    searchText: string;
    selectedIds?: string[];
    top?: number;
}

/**
 * Splits a delimited string of record ids into a clean, de-duplicated list.
 * Braces/parens wrapped GUIDs are stripped so that values copied straight out
 * of a GUID column keep working.
 */
export function parseDelimitedIds(value: string | undefined, delimiter: string = DEFAULT_DELIMITER): string[] {
    if (!value) {
        return [];
    }

    const separator = normalizeDelimiter(delimiter);
    const seen: { [key: string]: boolean } = {};
    const result: string[] = [];

    value
        .split(separator)
        .map((part) => normalizeId(part))
        .forEach((id) => {
            if (id.length > 0 && !seen[id.toLowerCase()]) {
                seen[id.toLowerCase()] = true;
                result.push(id);
            }
        });

    return result;
}

/** Joins ids back into the string persisted to the bound field. */
export function serializeIds(ids: string[], delimiter: string = DEFAULT_DELIMITER): string {
    const separator = normalizeDelimiter(delimiter);
    return ids
        .map((id) => normalizeId(id))
        .filter((id) => id.length > 0)
        .join(separator);
}

/** Strips the `{ }`, `( )` and surrounding whitespace Dataverse likes to add. */
export function normalizeId(value: string | undefined | null): string {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim().replace(/^[({\s]+/, "").replace(/[)}\s]+$/, "");
}

export function isGuid(value: string | undefined | null): boolean {
    return !!value && GUID_PATTERN.test(String(value).trim());
}

/** Normalises the configured delimiter to exactly one non-empty character. */
export function normalizeDelimiter(delimiter: string | undefined | null): string {
    if (delimiter === undefined || delimiter === null) {
        return DEFAULT_DELIMITER;
    }

    const trimmed = String(delimiter).trim();
    return trimmed.length === 0 ? DEFAULT_DELIMITER : trimmed.charAt(0);
}

/** Escapes a value so it can be embedded in a FetchXML string literal. */
export function escapeFetchXmlValue(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/** Escapes a value so it can be embedded as a FetchXML attribute value. */
export function escapeFetchXmlAttribute(value: string): string {
    return escapeFetchXmlValue(value);
}

/**
 * Derives the OData entity set for a table. The form context metadata is
 * authoritative; otherwise fall back to the same naive pluralisation the
 * Power Apps framework `EntitySet` helper applies.
 */
export function resolveEntitySetName(
    entityName: string,
    override: string | undefined,
    metadata?: { EntitySetName?: string; EntitySetNamePlural?: string }
): string {
    const explicit = normalizeId(override);
    if (explicit.length > 0) {
        return explicit;
    }

    if (metadata) {
        const fromMetadata = normalizeId(metadata.EntitySetName) || normalizeId(metadata.EntitySetNamePlural);
        if (fromMetadata.length > 0) {
            return fromMetadata;
        }
    }

    if (!entityName) {
        return "";
    }

    return entityName.toLowerCase().endsWith("s") ? `${entityName}es` : `${entityName}s`;
}

/** Builds the FetchXML used to search the lookup table. */
export function buildSearchFetchXml(options: IFetchXmlOptions): string {
    const {
        entityName,
        displayAttribute,
        idAttribute,
        primaryNameAttribute,
        searchText,
        top = DEFAULT_MAX_OPTIONS
    } = options;

    const attributes = [displayAttribute, idAttribute, primaryNameAttribute]
        .filter((attribute, index, all) => !!attribute && all.indexOf(attribute) === index)
        .map((attribute) => `<attribute name="${escapeFetchXmlAttribute(attribute)}" />`)
        .join("");

    const conditions: string[] = [];
    if (searchText && searchText.trim().length > 0) {
        const value = escapeFetchXmlValue(searchText.trim());
        conditions.push(
            `<condition attribute="${escapeFetchXmlAttribute(displayAttribute)}" operator="like" value="%${value}%" />`
        );
    }
    if (options.ids && options.ids.length > 0) {
        const values = options.ids
            .slice(0, MAX_IN_CLAUSE_SIZE)
            .map((id) => `<value>${escapeFetchXmlValue(normalizeId(id))}</value>`)
            .join("");
        conditions.push(
            `<condition attribute="${escapeFetchXmlAttribute(idAttribute)}" operator="in">${values}</condition>`
        );
    }

    const filter = conditions.length > 0 ? `<filter type="and">${conditions.join("")}</filter>` : "";
    const order = `<order attribute="${escapeFetchXmlAttribute(displayAttribute)}" />`;
    const limit = `<limit><value>${toPositiveInt(top, DEFAULT_MAX_OPTIONS)}</value></limit>`;

    return (
        `<fetch mapping="logical" distinct="true">` +
        `<entity name="${escapeFetchXmlAttribute(entityName)}">` +
        attributes +
        filter +
        order +
        limit +
        `</entity>` +
        `</fetch>`
    );
}

/** Builds the FetchXML used to hydrate the pre-selected records. */
export function buildHydrateFetchXml(options: IFetchXmlOptions): string {
    return buildSearchFetchXml({ ...options, searchText: undefined });
}

/** Projects raw WebAPI records onto the option shape used by the control. */
export function toOptions(
    records: Array<Record<string, any>> | undefined,
    idAttribute: string,
    primaryNameAttribute: string,
    displayAttribute: string
): IMultiSelectLookupOption[] {
    if (!records || records.length === 0) {
        return [];
    }

    const seen: { [key: string]: boolean } = {};
    const options: IMultiSelectLookupOption[] = [];

    records.forEach((record) => {
        const id = normalizeId(record[idAttribute]);
        if (id.length === 0 || seen[id.toLowerCase()]) {
            return;
        }
        seen[id.toLowerCase()] = true;

        const primaryName = toDisplayString(record[primaryNameAttribute]);
        const name = toDisplayString(record[displayAttribute]) || primaryName || id;

        options.push({ id, name, primaryName: primaryName || name });
    });

    return options;
}

/**
 * Client side search + trim, used to filter the already fetched page so that
 * typing feels instant before the server round trip completes. Records that
 * are already selected are always kept so the user can deselect them.
 */
export function filterOptions(
    options: IMultiSelectLookupOption[],
    searchText: string,
    selectedIds: string[] = [],
    top: number = DEFAULT_MAX_OPTIONS
): IMultiSelectLookupOption[] {
    const needle = (searchText || "").trim().toLowerCase();
    const selected: { [key: string]: boolean } = {};

    selectedIds.forEach((id) => {
        const normalized = normalizeId(id).toLowerCase();
        if (normalized.length > 0) {
            selected[normalized] = true;
        }
    });

    const limit = toPositiveInt(top, DEFAULT_MAX_OPTIONS);
    const result: IMultiSelectLookupOption[] = [];

    for (let i = 0; i < options.length && result.length < limit; i++) {
        const option = options[i];
        if (selected[option.id.toLowerCase()]) {
            result.push(option);
            continue;
        }
        if (
            needle.length === 0 ||
            option.name.toLowerCase().indexOf(needle) !== -1 ||
            option.id.toLowerCase().indexOf(needle) !== -1
        ) {
            result.push(option);
        }
    }

    return result;
}

/** Adds the option when absent, removes it when present. Returns a new array. */
export function toggleSelection(
    selected: IMultiSelectLookupOption[],
    option: IMultiSelectLookupOption
): IMultiSelectLookupOption[] {
    const exists = isSelected(selected, option);
    if (exists) {
        return selected.filter((item) => item.id.toLowerCase() !== option.id.toLowerCase());
    }
    return selected.concat([option]);
}

/** True when every option in `candidates` is already part of `selected`. */
export function areAllSelected(
    selected: IMultiSelectLookupOption[],
    candidates: IMultiSelectLookupOption[]
): boolean {
    if (candidates.length === 0) {
        return false;
    }
    return candidates.every((candidate) => isSelected(selected, candidate));
}

export function isSelected(
    selected: IMultiSelectLookupOption[],
    option: IMultiSelectLookupOption
): boolean {
    const id = option.id.toLowerCase();
    return selected.some((item) => item.id.toLowerCase() === id);
}

/**
 * Drops selections that are no longer present in `options`, so that a refresh
 * never resurrects a record the user removed in the meantime.
 */
export function retainSelection(
    selected: IMultiSelectLookupOption[],
    options: IMultiSelectLookupOption[]
): IMultiSelectLookupOption[] {
    return selected.filter((item) => options.some((candidate) => candidate.id.toLowerCase() === item.id.toLowerCase()));
}

function toDisplayString(value: any): string {
    return value === undefined || value === null ? "" : String(value);
}

function toPositiveInt(value: number | undefined, fallback: number): number {
    if (value === undefined || value === null || isNaN(value) || value <= 0) {
        return fallback;
    }
    return Math.floor(value);
}
