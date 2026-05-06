import { Tabs } from 'antd';
import { useMemo, useState } from 'react';

import { AppKuEditableGrid } from '../grid/AppKuEditableGrid.jsx';
import { AppKuWorkbookToolbar } from './AppKuWorkbookToolbar.jsx';

/**
 * Renders a tabbed workbook of editable grids.
 */
export function AppKuWorkbook ({
    activeKey,
    className,
    defaultActiveKey,
    fileName = 'workbook',
    gridProps,
    onActiveKeyChange,
    onSheetsChange,
    sheets = [],
    showToolbar = true
}) {
    const firstKey = sheets[0]?.key;
    const [ localActiveKey, setLocalActiveKey ] = useState(defaultActiveKey || firstKey);
    const resolvedActiveKey = activeKey ?? localActiveKey ?? firstKey;
    const activeSheet = sheets.find((sheet) => sheet.key === resolvedActiveKey) || sheets[0];

    function setActiveSheet (nextActiveKey) {
        setLocalActiveKey(nextActiveKey);
        onActiveKeyChange?.(nextActiveKey);
    }

    function updateSheetRows (sheetKey, event) {
        if (!onSheetsChange) {
            return;
        }

        const nextRows = [];
        event.api.forEachNode((node) => {
            nextRows.push(node.data);
        });

        onSheetsChange(sheets.map((sheet) => sheet.key === sheetKey
            ? {
                ...sheet,
                rowData: nextRows
            }
            : sheet));
    }

    const tabItems = useMemo(() => sheets.map((sheet) => ({
        key: sheet.key,
        label: sheet.title,
        children: (
            <AppKuEditableGrid
                {...gridProps}
                {...sheet.gridProps}
                columnDefs={sheet.columnDefs}
                rowData={sheet.rowData}
                onCellValueChanged={(event) => {
                    updateSheetRows(sheet.key, event);
                    sheet.onCellValueChanged?.(event);
                    gridProps?.onCellValueChanged?.(event);
                }}
            />
        )
    })), [
        gridProps,
        sheets
    ]);

    const classes = [
        'appku-workbook',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            {showToolbar && (
                <AppKuWorkbookToolbar
                    activeSheet={activeSheet}
                    fileName={fileName}
                    sheets={sheets}
                />
            )}
            <Tabs
                activeKey={resolvedActiveKey}
                items={tabItems}
                onChange={setActiveSheet}
            />
        </div>
    );
}
