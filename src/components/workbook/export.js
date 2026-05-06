const formulaPrefixPattern = /^[=+\-@\t\r]/;
const invalidSheetNamePattern = /[\][*?/\\:]/g;

/**
 * Returns a stable filename with the expected extension.
 */
export function withExtension (fileName, extension) {
    return fileName.toLowerCase().endsWith(`.${extension}`)
        ? fileName
        : `${fileName}.${extension}`;
}

/**
 * Returns a safe Excel worksheet name.
 */
export function toWorksheetName (title, fallback) {
    const value = String(title || fallback || 'Sheet')
        .replace(invalidSheetNamePattern, ' ')
        .trim();

    return (value || 'Sheet').slice(0, 31);
}

/**
 * Returns exportable columns from AG Grid column definitions.
 */
export function toExportColumns (columnDefs = []) {
    return columnDefs
        .filter((column) => column.field && !column.hide)
        .map((column) => ({
            field: column.field,
            header: column.headerName || column.field
        }));
}

/**
 * Escapes a cell value for CSV output.
 */
export function toCsvCell (value) {
    if (value === null || value === undefined) {
        return '';
    }

    const text = String(value);
    const safeText = formulaPrefixPattern.test(text) ? `'${text}` : text;

    if (/[",\n\r]/.test(safeText)) {
        return `"${safeText.replaceAll('"', '""')}"`;
    }

    return safeText;
}

/**
 * Converts sheet data to CSV.
 */
export function toCsv (sheet) {
    const columns = toExportColumns(sheet.columnDefs);
    const rows = sheet.rowData || [];
    const header = columns.map((column) => toCsvCell(column.header)).join(',');
    const body = rows.map((row) => columns
        .map((column) => toCsvCell(row[column.field]))
        .join(','));

    return [
        header,
        ...body
    ].join('\n');
}

/**
 * Downloads a blob using browser APIs.
 */
export function downloadBlob (blob, fileName) {
    const url = globalThis.URL.createObjectURL(blob);
    const anchor = globalThis.document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    globalThis.URL.revokeObjectURL(url);
}

/**
 * Downloads a sheet as CSV.
 */
export function downloadSheetCsv (sheet, fileName) {
    const blob = new globalThis.Blob([ toCsv(sheet) ], {
        type: 'text/csv;charset=utf-8'
    });

    downloadBlob(blob, withExtension(fileName, 'csv'));
}

/**
 * Downloads a workbook as XLSX.
 */
export async function downloadWorkbookXlsx (sheets, fileName) {
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();

    sheets.forEach((sheet, index) => {
        const worksheet = workbook.addWorksheet(toWorksheetName(sheet.title, `Sheet ${index + 1}`));
        const columns = toExportColumns(sheet.columnDefs);

        worksheet.columns = columns.map((column) => ({
            header: column.header,
            key: column.field,
            width: Math.max(String(column.header).length + 2, 14)
        }));

        (sheet.rowData || []).forEach((row) => {
            worksheet.addRow(Object.fromEntries(columns.map((column) => [
                column.field,
                row[column.field]
            ])));
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new globalThis.Blob([ buffer ], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    downloadBlob(blob, withExtension(fileName, 'xlsx'));
}
