import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
    type ColumnFiltersState,
    type ColumnOrderState,
    type ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getGroupedRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type GroupingState,
    type OnChangeFn,
    type RowSelectionState,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, ChevronRight, Download, Filter, GripHorizontal } from 'lucide-react';
import "./grid.css";

// --- Utility Components ---

function DebouncedInput({
                            value: initialValue,
                            onChange,
                            debounce = 500,
                            ...props
                        }: {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, onChange]);

    return (
        <input {...props} value={value} onChange={e => setValue(e.target.value)} />
    );
}

// --- Main Component ---

interface GridProps<TData extends Record<string, any>> {
    data: TData[];
    columns: any[];
    getRowId?: (row: TData) => string;
    loading?: boolean;
    error?: string | React.ReactNode;

    // Pagination
    paginationMode?: 'client' | 'server';
    page?: number;
    pageSize?: number;
    rowCount?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;

    // Selection
    selectionUnit?: 'row' | 'cell' | 'mixed';
    rowSelectionMode?: 'none' | 'single' | 'multiple';
    selectedRowIds?: string[];
    onRowSelectionChange?: (ids: string[], rows: TData[]) => void;

    // Editing
    editable?: boolean;
    onCellEditCommit?: (params: any) => void;

    // Grouping
    groupBy?: string[];

    // Layout & Styling
    height?: string | number;
    className?: string;
    gridLines?: 'none' | 'horizontal' | 'vertical' | 'both'; // NEW
    striped?: boolean; // NEW

    // Export
    onExportRequest?: (format: 'csv' | 'excel') => void;
}

function Grid<TData extends Record<string, any>>({
                                                     data,
                                                     columns,
                                                     getRowId,
                                                     loading = false,
                                                     error,
                                                     paginationMode = 'client',
                                                     page: controlledPage,
                                                     pageSize: controlledPageSize = 10,
                                                     rowCount,
                                                     onPageChange,
                                                     onPageSizeChange,
                                                     selectionUnit = 'row',
                                                     rowSelectionMode = 'multiple',
                                                     selectedRowIds,
                                                     onRowSelectionChange,
                                                     editable = false,
                                                     onCellEditCommit,
                                                     groupBy = [],
                                                     height = '600px',
                                                     className = '',
                                                     gridLines = 'horizontal', // Default
                                                     striped = false,
                                                     onExportRequest,
                                                 }: GridProps<TData>) {
    // --- State Management ---
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [grouping, setGrouping] = useState<GroupingState>(groupBy);
    const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Drag State
    const draggingColumn = useRef<string | null>(null);
    const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

    // --- Handlers ---
    const handleRowSelectionChange: OnChangeFn<RowSelectionState> = useCallback(
        (updaterOrValue) => {
            const newSelection = typeof updaterOrValue === 'function'
                ? updaterOrValue(rowSelection)
                : updaterOrValue;
            setRowSelection(newSelection);

            if (onRowSelectionChange) {
                const selectedIds = Object.keys(newSelection).filter((id) => newSelection[id]);
                const selectedRows = data.filter(row => {
                    const id = getRowId ? getRowId(row) : (row as any).id;
                    return selectedIds.includes(id);
                });
                onRowSelectionChange(selectedIds, selectedRows);
            }
        },
        [rowSelection, onRowSelectionChange, data, getRowId]
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            columnOrder,
            rowSelection,
            expanded,
            grouping,
        },
        getRowId,
        enableRowSelection: rowSelectionMode !== 'none',
        enableMultiRowSelection: rowSelectionMode === 'multiple',
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onRowSelectionChange: handleRowSelectionChange,
        onExpandedChange: setExpanded,
        onGroupingChange: setGrouping,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: paginationMode === 'client' ? getPaginationRowModel() : undefined,
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        manualPagination: paginationMode === 'server',
        pageCount: paginationMode === 'server' && rowCount ? Math.ceil(rowCount / controlledPageSize) : undefined,
    });

    // --- Virtualization ---
    const parentRef = useRef<HTMLDivElement>(null);
    const { rows } = table.getRowModel();

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
        overscan: 5,
    });

    // Sync external selection
    useEffect(() => {
        if (selectedRowIds) {
            const newSelection: RowSelectionState = {};
            selectedRowIds.forEach(id => { newSelection[id] = true; });
            setRowSelection(prev => {
                const isSame = Object.keys(prev).length === selectedRowIds.length &&
                    selectedRowIds.every(id => prev[id]);
                return isSame ? prev : newSelection;
            });
        }
    }, [selectedRowIds]);

    // --- Drag & Drop Logic ---
    const onDragStart = (e: React.DragEvent, columnId: string) => {
        draggingColumn.current = columnId;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        e.currentTarget.classList.add('dragging');
    };

    const onDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault(); // Allow drop
        // Only update state if different to prevent excessive renders
        if (dragOverTarget !== columnId) {
            setDragOverTarget(columnId);
        }
    };

    const onDragLeave = (e: React.DragEvent) => {
        // Optional: Clear target if leaving the table header area entirely
        // Hard to do perfectly with child elements, so usually relying on Drop/End is safer
    };

    const onDrop = (e: React.DragEvent, targetColumnId: string) => {
        e.currentTarget.classList.remove('dragging');
        const draggedColumnId = draggingColumn.current;

        if (draggedColumnId && draggedColumnId !== targetColumnId) {
            const currentOrder = table.getState().columnOrder.length > 0
                ? [...table.getState().columnOrder]
                : table.getVisibleLeafColumns().map(c => c.id);

            const draggedIndex = currentOrder.indexOf(draggedColumnId);
            const targetIndex = currentOrder.indexOf(targetColumnId);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                currentOrder.splice(draggedIndex, 1);
                currentOrder.splice(targetIndex, 0, draggedColumnId);
                setColumnOrder(currentOrder);
            }
        }
        // Reset state
        draggingColumn.current = null;
        setDragOverTarget(null);
    };

    // Helper to determine visual drop side
    const getDropIndicatorClass = (columnId: string) => {
        if (!draggingColumn.current || !dragOverTarget || dragOverTarget !== columnId) return '';

        // We need to check indices to decide if we are dropping "before" (left) or "after" (right)
        const currentOrder = table.getState().columnOrder.length > 0
            ? table.getState().columnOrder
            : table.getVisibleLeafColumns().map(c => c.id);

        const draggedIndex = currentOrder.indexOf(draggingColumn.current);
        const targetIndex = currentOrder.indexOf(columnId);

        if (draggedIndex === -1 || targetIndex === -1) return '';

        // If moving Right (0 -> 2), the drop target (2) should show indicator on the Right
        // If moving Left (2 -> 0), the drop target (0) should show indicator on the Left
        return draggedIndex < targetIndex ? 'drop-target-right' : 'drop-target-left';
    };


    // --- Export ---
    const handleExport = (format: 'csv' | 'excel') => {
        if (onExportRequest) {
            onExportRequest(format);
            return;
        }
        if (format === 'csv') {
            const headers = table.getVisibleLeafColumns().map(col => col.columnDef.header as string);
            const rows = table.getRowModel().rows.map(row =>
                table.getVisibleLeafColumns().map(col => {
                    const value = row.getValue(col.id);
                    return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                })
            );
            const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'export.csv'; a.click();
            URL.revokeObjectURL(url);
        }
    };

    // --- Editing ---
    const startEditing = (rowId: string, columnId: string) => {
        if (editable) setEditingCell({ rowId, columnId });
    };

    const commitEdit = (rowId: string, columnId: string, value: any) => {
        onCellEditCommit?.({ rowId, columnId, value });
        setEditingCell(null);
    };

    // Class generation for grid lines
    const gridLineClass = `grid-lines-${gridLines}`;
    const stripedClass = striped ? 'grid-striped' : '';

    return (
        <div className={`grid-container ${className}`} style={{ height }}>
            {/* Toolbar */}
            <div className="grid-toolbar">
                <div className="toolbar-left">
                    <h3 className="toolbar-title">Data Grid</h3>
                    {loading && <span className="loading-indicator">Loading...</span>}
                </div>
                <div className="toolbar-right">
                    <button className={`toolbar-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)} title="Toggle filters">
                        <Filter size={16} />
                    </button>
                    <button className="toolbar-btn" onClick={() => handleExport('csv')} title="Export to CSV">
                        <Download size={16} />
                    </button>
                </div>
            </div>

            {error && <div className="grid-error"><span className="error-text">{error}</span></div>}

            {/* Virtualized Table Area */}
            <div className={`grid-scroll-container ${gridLineClass} ${stripedClass}`} ref={parentRef}>
                <div className="grid-table-role" role="grid">
                    {/* Header */}
                    <div className="grid-header-group">
                        {table.getHeaderGroups().map(headerGroup => (
                            <div key={headerGroup.id} className="grid-header-row" style={{ display: 'flex', width: '100%' }}>
                                {headerGroup.headers.map(header => (
                                    <div
                                        key={header.id}
                                        className={`grid-header-cell ${header.column.getCanSort() ? 'sortable' : ''} ${getDropIndicatorClass(header.column.id)}`}
                                        style={{ width: header.getSize(), display: 'flex' }}
                                        draggable={!header.column.getIsPinned() && header.column.id !== 'select'}
                                        onDragStart={(e) => onDragStart(e, header.column.id)}
                                        onDragOver={(e) => onDragOver(e, header.column.id)}
                                        onDragLeave={onDragLeave}
                                        onDrop={(e) => onDrop(e, header.column.id)}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div className="header-content">
                                                <div className="header-top-row">
                                                    {header.column.id !== 'select' && (
                                                        <GripHorizontal size={14} className="drag-handle" />
                                                    )}
                                                    <div
                                                        className="header-label"
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getIsSorted() && (
                                                            <span className="sort-indicator">
                                                                {header.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {showFilters && header.column.getCanFilter() && (
                                                    <div className="column-filter">
                                                        <DebouncedInput
                                                            value={(header.column.getFilterValue() ?? '') as string}
                                                            onChange={value => header.column.setFilterValue(value)}
                                                            placeholder="Filter..."
                                                            className="filter-input"
                                                        />
                                                    </div>
                                                )}
                                                <div
                                                    onMouseDown={header.getResizeHandler()}
                                                    onTouchStart={header.getResizeHandler()}
                                                    className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Virtual Body */}
                    <div
                        className="grid-body"
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {rows.length === 0 ? (
                            <div className="empty-state">No data available</div>
                        ) : (
                            rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const row = rows[virtualRow.index];
                                return (
                                    <div
                                        key={row.id}
                                        className={`grid-row ${row.getIsSelected() ? 'selected' : ''} ${row.getIsGrouped() ? 'group-row' : ''}`}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`,
                                            display: 'flex',
                                        }}
                                        onClick={() => {
                                            if (rowSelectionMode !== 'none') row.toggleSelected();
                                        }}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <div
                                                key={cell.id}
                                                className="grid-cell"
                                                style={{ width: cell.column.getSize(), display: 'flex', alignItems: 'center' }}
                                                onDoubleClick={() => {
                                                    // @ts-ignore
                                                    if (editable && cell.column.columnDef.meta?.editable !== false) {
                                                        startEditing(row.id, cell.column.id);
                                                    }
                                                }}
                                            >
                                                {cell.getIsGrouped() ? (
                                                    <div className="group-cell">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                row.toggleExpanded();
                                                            }}
                                                            className="expand-btn"
                                                        >
                                                            {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                        </button>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        ({row.subRows.length})
                                                    </div>
                                                ) : cell.getIsAggregated() ? (
                                                    flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
                                                ) : cell.getIsPlaceholder() ? null :
                                                    editingCell?.rowId === row.id && editingCell?.columnId === cell.column.id ? (
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            defaultValue={cell.getValue() as string}
                                                            onBlur={(e) => commitEdit(row.id, cell.column.id, e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') commitEdit(row.id, cell.column.id, (e.target as HTMLInputElement).value);
                                                                else if (e.key === 'Escape') setEditingCell(null);
                                                            }}
                                                            className="cell-editor"
                                                        />
                                                    ) : (
                                                        flexRender(cell.column.columnDef.cell, cell.getContext())
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Pagination */}
            <div className="grid-footer">
                <div className="pagination-info">
                    Showing {rows.length} of {paginationMode === 'server' ? rowCount : table.getFilteredRowModel().rows.length} rows
                    {Object.keys(rowSelection).length > 0 && (
                        <span className="selection-info"> • {Object.keys(rowSelection).length} selected</span>
                    )}
                </div>
                <div className="pagination-controls">
                    <button className="pagination-btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</button>
                    <span className="pagination-page">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
                    <button className="pagination-btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                            const size = Number(e.target.value);
                            table.setPageSize(size);
                            onPageSizeChange?.(size);
                        }}
                        className="page-size-select"
                    >
                        {[10, 20, 30, 50, 100, 500, 1000].map(pageSize => (
                            <option key={pageSize} value={pageSize}>{pageSize} per page</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default Grid;
