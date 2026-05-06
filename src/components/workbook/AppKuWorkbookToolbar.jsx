import { DownloadOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import Space from 'antd/es/space';

import { downloadSheetCsv, downloadWorkbookXlsx } from './export.js';

/**
 * Renders workbook export actions.
 */
export function AppKuWorkbookToolbar ({
    activeSheet,
    disabled = false,
    fileName = 'workbook',
    sheets = []
}) {
    return (
        <Space className="appku-workbook-toolbar">
            <Button
                icon={<DownloadOutlined />}
                disabled={disabled || !activeSheet}
                onClick={() => downloadSheetCsv(activeSheet, activeSheet?.title || fileName)}
            >
                CSV
            </Button>
            <Button
                type="primary"
                icon={<DownloadOutlined />}
                disabled={disabled || sheets.length === 0}
                onClick={() => downloadWorkbookXlsx(sheets, fileName)}
            >
                XLSX
            </Button>
        </Space>
    );
}
