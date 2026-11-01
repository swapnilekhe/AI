/**
 * A single selectable record in a MultiSelectLookup.
 *
 * `id` is the raw primary key value (usually a GUID string) and is what gets
 * written back to the bound field. `name` is the human readable label and
 * `primaryName` is the table's primary name column, kept separate so the
 * control can fall back to it when `name` is null.
 */
export interface IMultiSelectLookupOption {
    id: string;
    name: string;
    primaryName: string;
}
