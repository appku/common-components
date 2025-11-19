import React from 'react';

export interface GridProps<TData extends Record<string, any>> {
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
    gridLines?: 'none' | 'horizontal' | 'vertical' | 'both';
    striped?: boolean;

    // Export
    onExportRequest?: (format: 'csv' | 'excel') => void;
}
