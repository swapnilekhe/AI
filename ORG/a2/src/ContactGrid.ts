declare const React: any;
declare const ReactDOM: any;
declare const FluentUIReact: any;

type IColumn = any;

type ContactFilter = {
  firstname: string;
  lastname: string;
  email: string;
};

interface ContactRecord {
  contactid: string;
  firstname?: string;
  lastname?: string;
  emailaddress1?: string;
}

interface ContactGridProps {
  context: ComponentFramework.Context<IInputs>;
  disabled: boolean;
}

const {
  TextField,
  PrimaryButton,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  Stack,
  Spinner,
  SpinnerSize
} = FluentUIReact;

const ContactGrid: React.FunctionComponent<ContactGridProps> = ({ context, disabled }) => {
  const [records, setRecords] = React.useState<ContactRecord[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize] = React.useState(10);
  const [sortColumn, setSortColumn] = React.useState("lastname");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [filters, setFilters] = React.useState<ContactFilter>({ firstname: "", lastname: "", email: "" });
  const [hasMore, setHasMore] = React.useState(false);

  const loadContacts = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const filterParts: string[] = [];
    if (filters.firstname.trim()) {
      filterParts.push(`contains(firstname,'${escapeODataString(filters.firstname.trim())}')`);
    }
    if (filters.lastname.trim()) {
      filterParts.push(`contains(lastname,'${escapeODataString(filters.lastname.trim())}')`);
    }
    if (filters.email.trim()) {
      filterParts.push(`contains(emailaddress1,'${escapeODataString(filters.email.trim())}')`);
    }

    let query = `?$select=contactid,firstname,lastname,emailaddress1`;
    if (filterParts.length) {
      query += `&$filter=${filterParts.join(" and ")}`;
    }

    query += `&$orderby=${sortColumn} ${sortDirection}`;
    query += `&$top=${pageSize + 1}`;
    query += `&$skip=${pageIndex * pageSize}`;

    try {
      const response = await context.webAPI.retrieveMultipleRecords("contact", encodeURI(query));
      const entities = (response.entities || []) as ContactRecord[];
      setHasMore(entities.length > pageSize);
      setRecords(entities.slice(0, pageSize));
    } catch (ex) {
      setError("Unable to load contacts. Check Dataverse access and permissions.");
      console.error(ex);
    } finally {
      setLoading(false);
    }
  }, [context, filters, pageIndex, pageSize, sortColumn, sortDirection]);

  React.useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const onChangeFilter = (field: keyof ContactFilter) => (_: any, newValue?: string) => {
    setPageIndex(0);
    setFilters(prev => ({ ...prev, [field]: newValue || "" }));
  };

  const onSortColumn = (_: any, column: IColumn) => {
    const columnKey = column.fieldName as string;
    if (sortColumn === columnKey) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
    setPageIndex(0);
  };

  const columns: IColumn[] = React.useMemo(
    () => [
      {
        key: "firstname",
        name: "First name",
        fieldName: "firstname",
        minWidth: 120,
        maxWidth: 240,
        isCollapsible: true,
        isSorted: sortColumn === "firstname",
        isSortedDescending: sortColumn === "firstname" && sortDirection === "desc",
        isResizable: true,
        onColumnClick: onSortColumn
      },
      {
        key: "lastname",
        name: "Last name",
        fieldName: "lastname",
        minWidth: 120,
        maxWidth: 240,
        isCollapsible: true,
        isSorted: sortColumn === "lastname",
        isSortedDescending: sortColumn === "lastname" && sortDirection === "desc",
        isResizable: true,
        onColumnClick: onSortColumn
      },
      {
        key: "emailaddress1",
        name: "Email",
        fieldName: "emailaddress1",
        minWidth: 160,
        maxWidth: 320,
        isCollapsible: true,
        isSorted: sortColumn === "emailaddress1",
        isSortedDescending: sortColumn === "emailaddress1" && sortDirection === "desc",
        isResizable: true,
        onColumnClick: onSortColumn
      },
      {
        key: "contactid",
        name: "ID",
        fieldName: "contactid",
        minWidth: 220,
        maxWidth: 280,
        isResizable: true
      }
    ],
    [sortColumn, sortDirection, onSortColumn]
  );

  return React.createElement(
    Stack,
    { tokens: { childrenGap: 16 } },
    React.createElement(
      Stack,
      { horizontal: true, wrap: true, tokens: { childrenGap: 12 } },
      React.createElement(TextField, {
        label: "First name",
        value: filters.firstname,
        onChange: onChangeFilter("firstname"),
        disabled: disabled,
        styles: { root: { minWidth: 220, maxWidth: 320 } }
      }),
      React.createElement(TextField, {
        label: "Last name",
        value: filters.lastname,
        onChange: onChangeFilter("lastname"),
        disabled: disabled,
        styles: { root: { minWidth: 220, maxWidth: 320 } }
      }),
      React.createElement(TextField, {
        label: "Email",
        value: filters.email,
        onChange: onChangeFilter("email"),
        disabled: disabled,
        styles: { root: { minWidth: 260, maxWidth: 360 } }
      })
    ),
    React.createElement(
      Stack,
      { horizontal: true, horizontalAlign: "space-between", verticalAlign: "end", tokens: { childrenGap: 12 } },
      React.createElement(
        Stack,
        { horizontal: true, tokens: { childrenGap: 8 } },
        React.createElement(PrimaryButton, {
          text: "Refresh",
          onClick: loadContacts,
          disabled: disabled
        }),
        React.createElement(DefaultButton, {
          text: "Previous",
          onClick: () => setPageIndex(prev => Math.max(prev - 1, 0)),
          disabled: disabled || pageIndex === 0
        }),
        React.createElement(DefaultButton, {
          text: "Next",
          onClick: () => setPageIndex(prev => prev + 1),
          disabled: disabled || !hasMore
        })
      ),
      React.createElement("span", { className: "ms-fontWeight-semibold" }, `Page ${pageIndex + 1}`)
    ),
    loading &&
      React.createElement(Spinner, {
        size: SpinnerSize.medium,
        label: "Loading contacts...",
        ariaLive: "assertive",
        labelPosition: "right"
      }),
    error && React.createElement("div", { style: { color: "#a4262c" } }, error),
    React.createElement(DetailsList, {
      items: records,
      columns,
      setKey: "set",
      layoutMode: DetailsListLayoutMode.fixedColumns,
      selectionMode: SelectionMode.none,
      compact: true,
      styles: { root: { border: "1px solid #edebe9", borderRadius: 4 }, contentWrapper: { overflowX: "auto" } }
    })
  );
};

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}
