import type {Table} from "@tanstack/react-table";

/**
 * Triggers a browser download for a CSV string.
 */
export const downloadCsvFile = (csvContent: string, filename: string = 'export.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * Helper to convert Table data to CSV string format.
 * Handles basics like quoting strings with commas.
 */
export const generateCsvFromTable = <TData>(table: Table<TData>): string => {
    const headers = table.getVisibleLeafColumns().map(col => col.columnDef.header as string);

    const rows = table.getRowModel().rows.map(row =>
        table.getVisibleLeafColumns().map(col => {
            const value = row.getValue(col.id);
            // Escape values containing commas
            return typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value;
        })
    );

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};
