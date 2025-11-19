# UI Grid Component Specifications (Draft v0.2)

> **Note:** This is a starting draft for a generic, powerful data grid. We will edit and refine this together.

## 1. Purpose & Scope

* Provide a reusable data grid component for internal applications.
* Support high-performance rendering for large datasets.
* Allow configurable columns, cell rendering, editing, and selection.
* Integrate cleanly with React state management and server APIs.

---

## 2. Core Concepts

### 2.1 Data Model

* **Row shape**: generic record type (e.g., `TRow extends Record<string, any>`).
* **Row identity**:

    * Required unique key per row (e.g., `id` or `rowKey` function).
* **Column definition**:

    * `field` (string key on row)
    * `headerName` (display label)
    * `width` / `minWidth` / `maxWidth`
    * `sortable` (bool)
    * `filterable` (bool)
    * `resizable` (bool)
    * `isEditable` (bool | (row) => bool)
    * `valueFormatter` (value, row) => display value
    * `valueParser` (input, row) => parsed value
    * `cellRenderer` (value, row, meta) => ReactNode
    * `cellEditor` (value, row, meta) => ReactNode
    * `align` (`left` | `center` | `right`)
    * `pinned` (`left` | `right` | none)
    * Optional grouping metadata (see 3.7):

        * `group?: { id: string; label?: string; order?: number }`

### 2.2 Layout & Sizing

* Column width model:

    * Fixed width (px)
    * Flexible (`flex` ratio)
    * Auto size based on content.
* Row height:

    * Fixed default (e.g., 32–40px)
    * Optional `getRowHeight(row)` override.
* Grid should support responsive width (fills parent container).

---

## 3. Features

### 3.1 Basic

* Render headers and rows in a scrollable container.
* Support horizontal and vertical scrolling.
* Sticky header row.
* Optional zebra striping.

### 3.2 Sorting

* Single-column sort by clicking header.
* Optional multi-column sort (Shift + click or API).
* Sort direction cycle: none → asc → desc.
* API hooks:

    * `onSortChange(sortModel)`
    * Controlled vs uncontrolled sort state.

### 3.3 Filtering

* Per-column filter UI (icon in header or separate row).
* Filter types: text, number, date, select, custom.
* Basic operators: equals, contains, startsWith, endsWith, `>`, `<`, `>=`, `<=`, in-range.
* API hooks:

    * `onFilterChange(filterModel)`
    * Controlled vs uncontrolled filter state.

### 3.4 Pagination / Data Loading

* Modes:

    * Client-side pagination (data array in memory).
    * Server-side pagination (calls `onQueryChange`).
* API:

    * `page`, `pageSize`, `onPageChange`, `onPageSizeChange`.
    * `onQueryChange({ sortModel, filterModel, page, pageSize })`.
* Loading state:

    * Show loading overlay / skeleton rows when `loading = true`.

### 3.5 Selection & Highlighting (Row + Cell)

* **Selection units supported:**

    * Row-level selection.
    * Cell-level selection.
    * Both can be enabled, but defaults should be simple (e.g., row-only).

* **Row selection**

    * Modes:

        * `none`
        * `single`
        * `multiple` (with checkbox column and/or Ctrl/Cmd + click).
    * Multi-select behavior:

        * Ctrl/Cmd + click to toggle individual rows.
        * Shift + click to select ranges.
    * Visuals:

        * Selected rows visually highlighted (background + border).
        * Optional hover highlight separate from selection.

* **Cell selection**

    * Modes:

        * `none`
        * `single`
        * `multiple` (contiguous ranges via Shift + arrow/click; disjoint via Ctrl/Cmd + click).
    * Multi-select behavior:

        * Click to focus a cell.
        * Shift + click to create a rectangular selection.
        * Keyboard (Shift + arrow keys) to grow/shrink selection.
    * Visuals:

        * Focused cell with strong border.
        * Selected range with lighter background.

* **Configuration model (conceptual)**

    * `selectionUnit?: 'row' | 'cell' | 'mixed'` (default: `'row'`).
    * `rowSelectionMode?: 'none' | 'single' | 'multiple'`.
    * `cellSelectionMode?: 'none' | 'single' | 'multiple'`.

* **APIs:**

    * Row-level:

        * `selectedRowIds?: string[]`
        * `onRowSelectionChange?(ids: string[], rows: TRow[])`.
    * Cell-level:

        * `selectedCells?: CellCoord[]` (e.g., `{ rowId, field }[]`)
        * `onCellSelectionChange?(cells: CellCoord[])`.

### 3.6 Cell Editing

* Enable/disable editing at grid level: `editable` flag.
* Per-column `isEditable` flag or function.
* Edit triggers:
    * Double-click cell
    * Enter key
    * F2 key
* Edit flow:
    * Enter edit mode
    * Show editor (input, select, custom)
    * Commit on Enter / blur
    * Cancel on Escape
* Validation:

    * Column-level validation fn: `(value, row) => error | null`
    * Optional row-level validation on commit.
* API:

    * `onCellEditStart(params)`
    * `onCellEditChange?(params)`
    * `onCellEditCommit(params)`
    * `onCellEditCancel?(params)`.

### 3.7 Column Grouping & Group Headers

* Ability to group columns under **group headers**.
* Group header behaviors:

    * Visual grouping row above column headers.
    * Collapsible group (optional) to hide/show child columns.
    * Draggable as a unit (optional).
* Config:

    * Columns can define `group`:

        * `group: { id: string; label?: string; order?: number }`
    * Or a separate `columnGroups` model:

        * `columnGroups: { id, label, children: string[] }[]`
* API:

    * `onColumnGroupToggle?(groupId: string, expanded: boolean)`.

### 3.8 Row Grouping with Expand/Collapse

* Ability to group rows by one or more fields.
* Group rows show as **group headers** with aggregate info:

    * Label (e.g., `Country: US (12)`).
    * Expand/collapse icon.
* Behavior:

    * Nested grouping (e.g., Country → Region → City) optional.
    * Keyboard accessible expand/collapse.
* Config:

    * `groupBy?: string[] | GroupDef[]`
    * Optional group row renderer: `groupRowRenderer?(groupParams) => ReactNode`.
* API:

    * `onGroupExpandChange?(groupKey, expanded: boolean)`
    * Optional `defaultGroupExpanded?: boolean | ((groupKey) => boolean)`.

### 3.9 Export to CSV / Excel

* Built-in export utilities:

    * **Export CSV**.
    * **Export Excel** (XLSX) if dependencies allowed; otherwise hook to provide data and let caller handle.
* Options:

    * Include/exclude hidden columns.
    * Include group rows or detail rows only.
    * Date/number formatting controlled by column `exportFormatter` or `valueFormatter`.
* API:

    * `onExportRequest?(options)`: caller decides how to handle export.
    * Or helper methods:

        * `exportToCSV(options?)`
        * `exportToExcel(options?)`.
* UI:

    * Optional built-in export button or menu in grid toolbar.

### 3.10 Column Resizing & Reordering (Drag & Drop)

* Resize by dragging column edges.
* Optional auto-size to content (double-click header edge).
* Column reordering:

    * Drag & drop headers to change order.
    * Honor pinned columns (cannot drag across pinned boundaries).
* Column order should be:

    * Reflected in `columns` state / model.
    * Persistable by caller if desired.
* API:

    * `onColumnResize?(columnState)`
    * `onColumnOrderChange?(orderedFieldIds: string[])`.

### 3.11 Row Operations

* Optional row actions column with menu (edit, delete, custom actions).
* API hooks:

    * `onRowClick?(row, event)`
    * `onRowDoubleClick?(row, event)`
    * `onRowContextMenu?(row, event)`.

### 3.12 Virtualization / Performance

* Virtualized rendering for large row counts.
* Optional column virtualization.
* Config:

    * `rowBuffer` (extra rows above/below viewport)
    * `overscanColumns`.
* Performance considerations:

    * Avoid unnecessary re-renders (memoized cells, pure components).
    * Optional `rowKey` function to stabilize identity.

### 3.13 Keyboard & Accessibility

* Full keyboard navigation:

    * Arrow keys to move focus between rows and cells.
    * Home/End/PageUp/PageDown.
    * Enter to edit, Escape to cancel.
* Focus management:

    * Single focused cell or row concept.
    * Restore focus after updates when possible.
* Accessibility:

    * Proper ARIA roles (`grid`, `row`, `columnheader`, `gridcell`).
    * Screen reader support for header, cell focus, sort state, and group expand/collapse.
    * Focus outlines and visible indicators.

### 3.14 Styling & Theming

* Support theming via design system (e.g., CSS vars or theme object).
* Configurable:

    * Header background, font, border.
    * Row hover, selected row styles.
    * Group row styles (indent, icon, bold).
    * Cell padding, font, alignment.
* Custom className props:

    * `className` on root.
    * `rowClassName?(row)` for dynamic styling.
    * `cellClassName?(params)`.

### 3.15 Empty & Error States

* Empty state message when no rows.
* Optional custom empty state renderer.
* Error state:

    * Show error banner or overlay when `error` prop is set.

---

## 4. API Surface (High-Level)

### 4.1 Props (Conceptual)

* `rows: TRow[]`
* `columns: ColumnDef<TRow>[]`
* `getRowId?: (row: TRow) => string`
* `loading?: boolean`
* `error?: string | ReactNode`

**Querying / data loading**

* `paginationMode?: 'client' | 'server'`
* `page?: number`
* `pageSize?: number`
* `rowCount?: number` (for server mode)
* `onPageChange?: (page: number) => void`
* `onPageSizeChange?: (pageSize: number) => void`
* `sortModel?: SortModel`
* `onSortChange?: (sortModel: SortModel) => void`
* `filterModel?: FilterModel`
* `onFilterChange?: (filterModel: FilterModel) => void`
* `onQueryChange?: (queryModel) => void` // combined hook

**Selection & interaction**

* `selectionUnit?: 'row' | 'cell' | 'mixed'`
* `rowSelectionMode?: 'none' | 'single' | 'multiple'`
* `cellSelectionMode?: 'none' | 'single' | 'multiple'`
* `selectedRowIds?: string[]`
* `onRowSelectionChange?: (ids: string[], rows: TRow[]) => void`
* `selectedCells?: CellCoord[]`
* `onCellSelectionChange?: (cells: CellCoord[]) => void`
* `onRowClick?`
* `onRowDoubleClick?`
* `onRowContextMenu?`

**Editing**

* `editable?: boolean`
* `onCellEditStart?`
* `onCellEditChange?`
* `onCellEditCommit?`
* `onCellEditCancel?`

**Grouping**

* `groupBy?: string[] | GroupDef[]`
* `onGroupExpandChange?`
* `defaultGroupExpanded?: boolean | ((groupKey) => boolean)`
* `groupRowRenderer?`

**Column layout**

* `columnGroups?: ColumnGroupDef[]`
* `onColumnOrderChange?`
* `onColumnResize?`

**Export**

* `onExportRequest?: (options: ExportOptions) => void`
* Or exposed instance methods via ref:

    * `gridRef.current.exportToCSV(options?)`
    * `gridRef.current.exportToExcel(options?)`

**Layout**

* `rowHeight?: number | ((row: TRow) => number)`
* `height?: number | string`
* `width?: number | string`

**Other**

* `className?: string`
* `style?: React.CSSProperties`

### 4.2 ColumnDef Shape (Conceptual)

* `field: string`
* `headerName?: string`
* `width?: number`
* `minWidth?: number`
* `maxWidth?: number`
* `flex?: number`
* `sortable?: boolean`
* `filterable?: boolean`
* `resizable?: boolean`
* `isEditable?: boolean | ((row: TRow) => boolean)`
* `valueGetter?: (row: TRow) => any`
* `valueFormatter?: (params) => ReactNode`
* `cellRenderer?: (params) => ReactNode`
* `cellEditor?: (params) => ReactNode`
* `align?: 'left' | 'center' | 'right'`
* `pinned?: 'left' | 'right' | undefined`
* `group?: { id: string; label?: string; order?: number }`
* `exportFormatter?: (params) => string | number | null`
* `headerClassName?: string`
* `cellClassName?: string | ((params) => string)`

---

## 5. Non-Goals (For Now)

* Full Excel-like formulas (belongs to "sheet" component).
* Cross-grid drag/drop.
* Pivot table UI / arbitrary pivoting.
* Inline chart editing (beyond basic renderers).

---

## 6. Future Enhancements (Nice-to-Have)

* Aggregations (sum, avg, min, max) for groups.
* Inline charts / sparklines in cells.
* Column state persistence helpers (localStorage / external store).
* Advanced filtering UI (filter builder, saved filters).
* Column-level security / permissions.

---

## 7. Implementation Notes (High-Level)

* Target framework: React + TypeScript.
* Consider headless core + styled wrapper approach:

    * Core hook: `useGrid` (state, events, models).
    * UI layer: `Grid` component using design system.
* Use virtualization library (e.g., `react-window` / `react-virtualized`) or custom.
* Ensure testability with unit + integration tests:

    * Keyboard navigation
    * Sorting/filtering
    * Editing
    * Group expand/collapse
    * Export formats
