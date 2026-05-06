import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([ AllCommunityModule ]);

/**
 * Renders an editable spreadsheet-style data grid.
 */
export function AppKuEditableGrid ({
    className,
    columnDefs,
    defaultColDef,
    height = 400,
    rowData,
    style,
    theme = 'ag-theme-quartz',
    ...props
}) {
    const classes = [
        'appku-sheet-grid',
        theme,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} style={{ height, ...style }}>
            <AgGridReact
                columnDefs={columnDefs}
                rowData={rowData}
                defaultColDef={{
                    editable: true,
                    filter: true,
                    resizable: true,
                    sortable: true,
                    ...defaultColDef
                }}
                undoRedoCellEditing
                {...props}
            />
        </div>
    );
}
