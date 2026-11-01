import { IInputs, IOutputs } from "./generatedControlInputsOutputs";
import { ComponentBase, ComponentFramework, React } from "@microsoft/pcf-core";
import type { IMultiSelectLookupOption } from "./IMultiSelectLookupOption";
import {
    areAllSelected,
    buildHydrateFetchXml,
    buildSearchFetchXml,
    DEFAULT_MAX_OPTIONS,
    filterOptions,
    isSelected,
    normalizeDelimiter,
    parseDelimitedIds,
    resolveEntitySetName,
    serializeIds,
    toOptions,
    toggleSelection
} from "./multiSelectLookupUtils";

/** CSS class names, kept in one place to match `css/MultiSelectLookup.css`. */
const CSS = {
    root: "msls-root",
    field: "msls-field",
    labelRow: "msls-labelRow",
    label: "msls-label",
    requiredStar: "msls-requiredStar",
    inputContainer: "msls-inputContainer",
    inputFocused: "msls-inputContainer--focused",
    inputError: "msls-inputContainer--error",
    inputDisabled: "msls-inputContainer--disabled",
    placeholder: "msls-placeholder",
    chevron: "msls-chevron",
    tag: "msls-tag",
    tagLabel: "msls-tagLabel",
    tagRemove: "msls-tagRemove",
    callout: "msls-panel",
    searchWrapper: "msls-searchWrapper",
    search: "msls-search",
    list: "msls-list",
    option: "msls-option",
    optionFocused: "msls-option--focused",
    checkbox: "msls-checkbox",
    checkboxChecked: "msls-checkbox--checked",
    optionLabel: "msls-optionLabel",
    optionSub: "msls-optionSub",
    footer: "msls-footer",
    footerCount: "msls-footerCount",
    footerButton: "msls-footerButton",
    empty: "msls-empty",
    status: "msls-status",
    statusIcon: "msls-statusIcon",
    error: "msls-error",
    spinner: "msls-spinner"
} as const;

const SEARCH_DEBOUNCE_MS = 250;

/** Maximum number of ids resolved in a single hydration request. */
const HYDRATE_BATCH_SIZE = 50;

/**
 * A tag based multi-select lookup for Dataverse / Model-Driven forms.
 *
 * The bound field holds a delimited list of primary key values (see the
 * `selectedItemsDelimiter` property). The control resolves those ids to
 * readable labels on load and writes the list back through an
 * `IValueUpdater` whenever the selection changes.
 */
export class MultiSelectLookupControl extends ComponentBase<IInputs, IOutputs>
    implements ComponentFramework.StandardControl {
    //#region State
    private _valueUpdater: ComponentFramework.IValueUpdater | undefined;
    private _inputId: string = "msls-input-" + this.context.factory.createGuid();
    private _labelId: string = "msls-label-" + this.context.factory.createGuid();
    private _listId: string = "msls-list-" + this.context.factory.createGuid();

    private _entityName: string = "";
    private _displayAttribute: string = "name";
    private _primaryIdAttribute: string = "";
    private _primaryNameAttribute: string = "";
    private _entitySetName: string = "";
    private _delimiter: string = ";";
    private _maxOptions: number = DEFAULT_MAX_OPTIONS;
    private _allowSearch: boolean = true;
    private _showSelectAll: boolean = true;
    private _isDisabled: boolean = false;
    private _isRequired: boolean = false;
    private _placeholderText: string = "Search records";
    private _labelText: string = "";
    private _errorMessage: string = "";

    private _isResolved: boolean = false;
    private _isOpen: boolean = false;
    private _isLoading: boolean = false;
    private _isInputFocused: boolean = false;
    private _focusedOptionIndex: number = -1;
    private _searchText: string = "";
    private _statusMessage: string = "";
    private _options: IMultiSelectLookupOption[] = [];
    private _selectedOptions: IMultiSelectLookupOption[] = [];

    private _searchTimer: any;
    private _loadToken: number = 0;
    private _hydrateToken: number = 0;
    private _isOutsideClickAttached: boolean = false;
    private _inputRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
    private _panelRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
    private _searchRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
    private _listRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
    private _optionRefs: Array<HTMLElement | null> = [];
    //#endregion

    public constructor(
        control: ComponentFramework.ControlConstructor<IInputs>,
        context: ComponentFramework.InitialiseContext<IOutputs>
    ) {
        super(control, context);
    }

    public init(): void {
        try {
            this._valueUpdater = this.context.factory.getValueUpdater();
        } catch (error) {
            // Hosts such as grids do not provide a value updater. The control
            // still renders and emits values through its outputs.
            this._valueUpdater = undefined;
        }

        const parameters = this.context.parameters;
        this._entityName = (parameters.entityName || "").trim();
        this._displayAttribute = (parameters.displayProperty || "name").trim();
        this._primaryIdAttribute = (parameters.primaryIdAttribute || parameters.PrimaryIdAttribute || "").trim();
        this._primaryNameAttribute = (parameters.PrimaryNameAttribute || "").trim();
        this._entitySetName = resolveEntitySetName(this._entityName, parameters.entitySetName, parameters.EntityMetadata);
        this._delimiter = normalizeDelimiter(parameters.selectedItemsDelimiter);
        this._maxOptions =
            parameters.maxOptions && parameters.maxOptions > 0 ? Math.floor(parameters.maxOptions) : DEFAULT_MAX_OPTIONS;
        this._allowSearch = parameters.allowSearch === undefined ? true : !!parameters.allowSearch;
        this._showSelectAll = parameters.showSelectAll === undefined ? true : !!parameters.showSelectAll;
        this._isDisabled = !!parameters.isDisabled;
        this._isRequired = !!parameters.isRequired;
        this._placeholderText = parameters.placeholderText || "Search records";
        this._labelText = parameters.labelText || "";
        this._errorMessage = parameters.errorMessage || "This field is required.";
    }

    public updateView(): void {
        this._options = [];
        this._focusedOptionIndex = -1;
        this._searchText = "";
        this._isResolved = false;
        this._resolveInitialSelection();
    }

    public getOutputValue(
        context: ComponentFramework.Context<IOutputs>,
        allProperties: ComponentFramework.DependentProperties<IInputs>,
        instance: ComponentFramework.ComponentInstance<IOutputs>
    ): ComponentFramework.PropertyValue {
        if (this._valueUpdater) {
            return this._valueUpdater.getValue();
        }
        return instance.value;
    }

    //#region Data loading
    /** Resolves the ids already stored in the bound field into readable tags. */
    private _resolveInitialSelection(): void {
        this._isResolved = true;

        const ids = parseDelimitedIds(this.context.parameters.defaultSelectedItems, this._delimiter);
        if (ids.length === 0) {
            this._selectedOptions = [];
            this._publishValue();
            return;
        }

        // Seed the tags with the raw ids so the control is never blank while
        // the labels are being resolved, then swap in the real names.
        this._selectedOptions = ids.map((id) => ({ id, name: id, primaryName: id }));

        if (!this._entityName || !this._entitySetName || !this._primaryIdAttribute) {
            this._statusMessage = "Configure the entity name to resolve record names.";
            return;
        }

        const token = ++this._hydrateToken;
        this._isLoading = true;

        this._hydrateIds(ids)
            .then((options) => {
                if (token !== this._hydrateToken) {
                    return;
                }
                this._isLoading = false;
                this._selectedOptions = this._mergeById(options, this._selectedOptions);
                this._publishValue();
            })
            .catch(() => {
                if (token !== this._hydrateToken) {
                    return;
                }
                this._isLoading = false;
                this._statusMessage = "Selected records could not be loaded.";
            });
    }

    /** Resolves ids to options in batches, keeping the original order. */
    private _hydrateIds(ids: string[]): Promise<IMultiSelectLookupOption[]> {
        const batches: string[][] = [];
        for (let i = 0; i < ids.length; i += HYDRATE_BATCH_SIZE) {
            batches.push(ids.slice(i, i + HYDRATE_BATCH_SIZE));
        }

        return Promise.all(
            batches.map((batch) =>
                this._retrieve(
                    buildHydrateFetchXml({
                        entityName: this._entityName,
                        displayAttribute: this._displayAttribute,
                        idAttribute: this._primaryIdAttribute,
                        primaryNameAttribute: this._primaryNameAttribute || undefined,
                        ids: batch,
                        top: HYDRATE_BATCH_SIZE
                    })
                )
            )
        ).then((results) => {
            const resolved: IMultiSelectLookupOption[] = [];
            results.forEach((records) => {
                resolved.push(
                    ...toOptions(records, this._primaryIdAttribute, this._primaryNameAttribute, this._displayAttribute)
                );
            });
            // Ids that no longer resolve (deleted / access denied) keep their
            // raw value so the user can still see and clear them.
            const byId = this._indexById(resolved);
            return ids.map((id) => byId[id.toLowerCase()] || { id, name: id, primaryName: id });
        });
    }

    /** Loads the option list for the callout, honouring the current search text. */
    private _loadOptions(searchText: string): void {
        const idAttribute = this._primaryIdAttribute || `${this._entityName}id`;

        if (!this._entityName || !this._entitySetName) {
            this._isLoading = false;
            this._statusMessage = "Set the entity name property to enable searching.";
            return;
        }

        const token = ++this._loadToken;
        this._isLoading = true;
        this._statusMessage = "";

        this._retrieve(
            buildSearchFetchXml({
                entityName: this._entityName,
                displayAttribute: this._displayAttribute,
                idAttribute,
                primaryNameAttribute: this._primaryNameAttribute || undefined,
                searchText,
                top: this._maxOptions
            })
        )
            .then((records) => {
                if (token !== this._loadToken) {
                    return;
                }
                this._isLoading = false;
                this._options = toOptions(records, idAttribute, this._primaryNameAttribute, this._displayAttribute);
                this._focusedOptionIndex = this._options.length > 0 ? 0 : -1;
                this._scrollFocusedOptionIntoView();
            })
            .catch((error: any) => {
                if (token !== this._loadToken) {
                    return;
                }
                this._isLoading = false;
                this._options = [];
                this._focusedOptionIndex = -1;
                this._statusMessage = error && error.message ? error.message : "Records could not be loaded.";
            });
    }

    private _retrieve(fetchXml: string): Promise<Array<Record<string, any>>> {
        const client = this.context.factory.createClient("Client", "/_api");
        return Promise.resolve(client.retrieveMultiple(encodeURIComponent(fetchXml), this._entitySetName));
    }
    //#endregion

    //#region Value publishing
    /** Serialises the current selection and pushes it to the bound field. */
    private _publishValue(): void {
        const value = serializeIds(
            this._selectedOptions.map((option) => option.id),
            this._delimiter
        );

        if (this._valueUpdater) {
            this._valueUpdater.updateOutputValue(
                value,
                () => {
                    this.notifyOutputValueChanged();
                },
                (error: Error) => {
                    this._statusMessage = error && error.message ? error.message : "The value could not be saved.";
                },
                false
            );
            return;
        }

        // No value updater (e.g. a grid host): fall back to the form item so
        // the selection is still persisted where the host supports it.
        if (this.formItem) {
            this.formItem.setValue(value, this.valueChangedCallback);
        }
        this.notifyOutputValueChanged();
    }
    //#endregion

    //#region Small helpers
    private _indexById(options: IMultiSelectLookupOption[]): { [key: string]: IMultiSelectLookupOption } {
        const index: { [key: string]: IMultiSelectLookupOption } = {};
        options.forEach((option) => {
            index[option.id.toLowerCase()] = option;
        });
        return index;
    }

    /** Keeps the current tag order while refreshing labels from the server. */
    private _mergeById(
        fresh: IMultiSelectLookupOption[],
        current: IMultiSelectLookupOption[]
    ): IMultiSelectLookupOption[] {
        const byId = this._indexById(fresh);
        return current.map((option) => byId[option.id.toLowerCase()] || option);
    }

    /** The option list actually shown, filtered by the search box. */
    private _visibleOptions(): IMultiSelectLookupOption[] {
        return filterOptions(
            this._options,
            this._searchText,
            this._selectedOptions.map((option) => option.id),
            this._maxOptions
        );
    }

    private _scrollFocusedOptionIntoView(): void {
        const node = this._optionRefs[this._focusedOptionIndex];
        const list = this._listRef.current;
        if (node && list && typeof node.scrollIntoView === "function") {
            try {
                node.scrollIntoView({ block: "nearest" });
            } catch (error) {
                // Older hosts do not accept the options bag.
                node.scrollIntoView(false);
            }
        }
    }

    private _getShowError(): boolean {
        return this._isRequired && this._selectedOptions.length === 0;
    }
    //#endregion

    //#region Event handlers
    private _onInputClick = (): void => {
        if (this._isDisabled) {
            return;
        }
        if (this._isOpen) {
            this._close();
        } else {
            this._open();
        }
    };

    private _onInputFocus = (): void => {
        this._isInputFocused = true;
    };

    private _onInputBlur = (): void => {
        this._isInputFocused = false;
    };

    private _onInputKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (this._isDisabled) {
            return;
        }

        switch (event.key) {
            case "ArrowDown":
            case "Enter":
            case " ":
                event.preventDefault();
                if (!this._isOpen) {
                    this._open();
                }
                break;
            case "ArrowUp":
                event.preventDefault();
                if (!this._isOpen) {
                    this._open();
                }
                break;
            case "Escape":
                if (this._isOpen) {
                    event.preventDefault();
                    this._close();
                }
                break;
            case "Backspace":
                // Mirrors the native tag input behaviour: backspace on an
                // empty search box removes the previous tag.
                if (this._searchText.length === 0 && this._selectedOptions.length > 0) {
                    this._removeTagAt(this._selectedOptions.length - 1);
                }
                break;
            default:
                break;
        }
    };

    private _onSearchChanged = (value: string | undefined): void => {
        const searchText = value || "";
        this._searchText = searchText;

        // Filter the current page immediately, then refresh from the server.
        this._focusedOptionIndex = 0;
        this._loadToken++;

        if (this._searchTimer) {
            clearTimeout(this._searchTimer);
        }
        this._searchTimer = setTimeout(() => {
            this._searchTimer = undefined;
            this._loadOptions(searchText);
        }, SEARCH_DEBOUNCE_MS);
    };

    private _onRemoveTag = (index: number): void => {
        this._removeTagAt(index);
        if (this._isOpen) {
            this._open();
        }
    };

    private _onRemoveTagMouseDown = (event: React.MouseEvent<HTMLElement>): void => {
        // Keep focus on the input so Backspace keeps working after a removal.
        event.preventDefault();
    };

    private _onToggleOption = (option: IMultiSelectLookupOption): void => {
        this._selectedOptions = toggleSelection(this._selectedOptions, option);
        this._publishValue();
    };

    private _onSelectAll = (): void => {
        const visible = this._visibleOptions();
        const allSelected = areAllSelected(this._selectedOptions, visible);
        const byId = this._indexById(this._selectedOptions);

        if (allSelected) {
            this._selectedOptions = this._selectedOptions.filter(
                (option) => !visible.some((candidate) => candidate.id.toLowerCase() === option.id.toLowerCase())
            );
        } else {
            visible.forEach((candidate) => {
                byId[candidate.id.toLowerCase()] = candidate;
            });
            this._selectedOptions = Object.keys(byId).map((key) => byId[key]);
        }

        this._publishValue();
    };

    private _onClearAll = (): void => {
        this._selectedOptions = [];
        this._publishValue();
    };

    private _onOptionMouseEnter = (index: number): void => {
        this._focusedOptionIndex = index;
    };

    private _onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        const visible = this._visibleOptions();
        if (visible.length === 0) {
            return;
        }

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                this._focusedOptionIndex = Math.min(this._focusedOptionIndex + 1, visible.length - 1);
                this._scrollFocusedOptionIntoView();
                break;
            case "ArrowUp":
                event.preventDefault();
                this._focusedOptionIndex = Math.max(this._focusedOptionIndex - 1, 0);
                this._scrollFocusedOptionIntoView();
                break;
            case "Enter":
                event.preventDefault();
                if (this._focusedOptionIndex >= 0 && this._focusedOptionIndex < visible.length) {
                    this._onToggleOption(visible[this._focusedOptionIndex]);
                }
                break;
            default:
                break;
        }
    };
    //#endregion

    //#region Open / close / mutate
    private _open = (): void => {
        if (this._isOpen || this._isDisabled) {
            return;
        }
        this._isOpen = true;
        this._searchText = "";
        this._loadOptions("");
        // Let the panel mount before moving focus into the search box.
        setTimeout(() => {
            const search = this._searchRef.current;
            if (search && typeof search.focus === "function") {
                search.focus();
            }
        }, 0);
    };

    private _close = (): void => {
        this._isOpen = false;
        this._focusedOptionIndex = -1;
        if (this._searchTimer) {
            clearTimeout(this._searchTimer);
            this._searchTimer = undefined;
        }
        // Invalidate any in-flight request so a late response cannot repopulate
        // the list after the user has closed the control.
        this._loadToken++;
    };

    private _removeTagAt(index: number): void {
        if (index < 0 || index >= this._selectedOptions.length) {
            return;
        }
        this._selectedOptions = this._selectedOptions.filter((_, position) => position !== index);
        this._publishValue();
    }
    //#endregion

    //#region Rendering
    public render(): React.ReactElement {
        if (!this._isResolved) {
            this._resolveInitialSelection();
        }

        return React.createElement(
            "div",
            { className: CSS.root },
            this._renderLabel(),
            React.createElement(
                "div",
                { className: CSS.field },
                this._renderInput(),
                this._renderCallout()
            ),
            this._renderError()
        );
    }

    private _renderLabel(): React.ReactElement | null {
        if (!this._labelText) {
            return null;
        }

        return React.createElement(
            "div",
            { className: CSS.labelRow, id: this._labelId },
            this._isRequired ? React.createElement("span", { className: CSS.requiredStar }, "*") : null,
            React.createElement("label", { className: CSS.label, htmlFor: this._inputId }, this._labelText)
        );
    }

    private _renderInput(): React.ReactElement {
        const classNames = [CSS.inputContainer];
        if (this._isInputFocused || this._isOpen) {
            classNames.push(CSS.inputFocused);
        }
        if (this._isDisabled) {
            classNames.push(CSS.inputDisabled);
        }
        if (this._getShowError()) {
            classNames.push(CSS.inputError);
        }

        return React.createElement(
            "div",
            {
                ref: this._inputRef,
                id: this._inputId,
                className: classNames.join(" "),
                role: "combobox",
                tabIndex: this._isDisabled ? -1 : 0,
                "aria-expanded": this._isOpen,
                "aria-haspopup": "listbox",
                "aria-labelledby": this._labelId,
                "aria-disabled": this._isDisabled,
                onClick: this._onInputClick,
                onFocus: this._onInputFocus,
                onBlur: this._onInputBlur,
                onKeyDown: this._onInputKeyDown
            },
            this._selectedOptions.length === 0
                ? React.createElement("span", { className: CSS.placeholder }, this._placeholderText)
                : this._selectedOptions.map((option, index) => this._renderTag(option, index)),
            this._isLoading ? this._renderSpinner() : null,
            React.createElement("span", { className: CSS.chevron, "aria-hidden": "true" }, "▼")
        );
    }

    private _renderTag(option: IMultiSelectLookupOption, index: number): React.ReactElement {
        return React.createElement(
            "div",
            { key: option.id, className: CSS.tag, title: option.name },
            React.createElement("span", { className: CSS.tagLabel }, option.name),
            !this._isDisabled
                ? React.createElement(
                      "button",
                      {
                          key: `${option.id}-remove`,
                          type: "button",
                          className: CSS.tagRemove,
                          title: "Remove",
                          "aria-label": `Remove ${option.name}`,
                          onClick: (event: React.MouseEvent<HTMLElement>) => {
                              event.stopPropagation();
                              this._onRemoveTag(index);
                          },
                          onMouseDown: this._onRemoveTagMouseDown
                      },
                      "✕"
                  )
                : null
        );
    }
    //#endregion

    private _renderCallout(): React.ReactElement | null {
        if (!this._isOpen) {
            return null;
        }

        return React.createElement(
            "div",
            { ref: this._panelRef, className: CSS.callout, role: "presentation" },
            this._allowSearch ? this._renderSearch() : null,
            this._renderOptionList(),
            this._showSelectAll ? this._renderFooter() : null
        );
    }

    private _renderSearch(): React.ReactElement {
        return React.createElement(
            "div",
            { className: CSS.searchWrapper },
            React.createElement("input", {
                ref: this._searchRef,
                type: "text",
                className: CSS.search,
                placeholder: this._placeholderText,
                value: this._searchText,
                autoComplete: "off",
                spellCheck: false,
                role: "combobox",
                "aria-expanded": true,
                "aria-controls": this._listId,
                "aria-label": "Search records",
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => this._onSearchChanged(event.target.value),
                onKeyDown: this._onListKeyDown
            })
        );
    }

    private _renderSpinner(): React.ReactElement {
        return React.createElement("div", {
            className: CSS.spinner,
            role: "status",
            "aria-label": "Loading"
        });
    }

    private _renderOptionList(): React.ReactElement {
        if (this._isLoading) {
            return React.createElement(
                "div",
                { className: CSS.status },
                this._renderSpinner(),
                React.createElement("span", null, "Loading records…")
            );
        }

        if (this._statusMessage) {
            return React.createElement(
                "div",
                { className: CSS.status },
                React.createElement("span", { className: CSS.statusIcon }, "⚠"),
                React.createElement("span", null, this._statusMessage)
            );
        }

        const visible = this._visibleOptions();
        this._optionRefs = [];

        if (visible.length === 0) {
            return React.createElement(
                "div",
                { className: CSS.empty },
                this._searchText ? `No records match "${this._searchText}".` : "No records available."
            );
        }

        return React.createElement(
            "div",
            {
                ref: this._listRef,
                id: this._listId,
                className: CSS.list,
                role: "listbox",
                "aria-multiselectable": true,
                onKeyDown: this._onListKeyDown
            },
            visible.map((option, index) => this._renderOption(option, index))
        );
    }

    private _renderOption(option: IMultiSelectLookupOption, index: number): React.ReactElement {
        const checked = isSelected(this._selectedOptions, option);
        const classNames = [CSS.option];
        if (index === this._focusedOptionIndex) {
            classNames.push(CSS.optionFocused);
        }

        return React.createElement(
            "div",
            {
                key: option.id,
                className: classNames.join(" "),
                role: "option",
                "aria-selected": checked,
                title: option.name,
                ref: (element: HTMLElement | null): void => {
                    this._optionRefs[index] = element;
                },
                onClick: () => this._onToggleOption(option),
                onMouseEnter: () => this._onOptionMouseEnter(index)
            },
            React.createElement(
                "span",
                { className: this._checkboxClassName(checked), "aria-hidden": "true" },
                checked ? "✓" : ""
            ),
            React.createElement(
                "span",
                { className: CSS.optionLabel },
                React.createElement("span", null, option.name),
                this._primaryNameAttribute && this._primaryNameAttribute !== this._displayAttribute
                    ? React.createElement("span", { className: CSS.optionSub }, option.primaryName)
                    : null
            )
        );
    }

    private _checkboxClassName(checked: boolean): string {
        return checked ? `${CSS.checkbox} ${CSS.checkboxChecked}` : CSS.checkbox;
    }

    private _renderFooter(): React.ReactElement {
        const visible = this._visibleOptions();
        const allSelected = areAllSelected(this._selectedOptions, visible);

        return React.createElement(
            "div",
            { className: CSS.footer },
            React.createElement("span", { className: CSS.footerCount }, `${this._selectedOptions.length} selected`),
            React.createElement(
                "button",
                {
                    key: "select-all",
                    type: "button",
                    className: CSS.footerButton,
                    disabled: this._isDisabled || visible.length === 0,
                    onClick: this._onSelectAll
                },
                allSelected ? "Clear results" : "Select all"
            ),
            this._selectedOptions.length > 0
                ? React.createElement(
                      "button",
                      {
                          key: "clear-all",
                          type: "button",
                          className: CSS.footerButton,
                          disabled: this._isDisabled,
                          onClick: this._onClearAll
                      },
                      "Clear all"
                  )
                : null
        );
    }

    private _renderError(): React.ReactElement | null {
        if (!this._getShowError()) {
            return null;
        }

        return React.createElement("div", { className: CSS.error, role: "alert" }, this._errorMessage);
    }

    //#region Lifecycle
    public onDidRender(): void {
        if (this._isOpen && !this._isOutsideClickAttached) {
            this._isOutsideClickAttached = true;
            document.addEventListener("mousedown", this._onDocumentMouseDown, true);
        } else if (!this._isOpen && this._isOutsideClickAttached) {
            this._detachOutsideClick();
        }
    }

    public onWillUnmount(): void {
        this._detachOutsideClick();
        if (this._searchTimer) {
            clearTimeout(this._searchTimer);
            this._searchTimer = undefined;
        }
    }

    private _detachOutsideClick(): void {
        if (this._isOutsideClickAttached) {
            document.removeEventListener("mousedown", this._onDocumentMouseDown, true);
            this._isOutsideClickAttached = false;
        }
    }

    private _onDocumentMouseDown = (event: MouseEvent): void => {
        const target = event.target as Node | null;
        if (!target) {
            return;
        }
        const input = this._inputRef.current;
        const panel = this._panelRef.current;
        if ((input && input.contains(target)) || (panel && panel.contains(target))) {
            return;
        }
        this._close();
    };
    //#endregion
}
