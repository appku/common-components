import {
    AppKuEditableGrid,
    AppKuButton,
    AppKuCard,
    AppKuProvider,
    AppKuSelect,
    AppKuTable,
    AppKuWorkbook,
    FormRow,
    Input,
    LoadingOverlay,
    PageShell,
    Toolbar,
    appKuToaster
} from 'appku-common-components';
import 'appku-common-components/grid.css';
import 'appku-common-components/styles.css';
import { useState } from 'react';

const environments = [
    { id: 'staging', label: 'Staging' },
    { id: 'review', label: 'Review' },
    { id: 'production', label: 'Production' }
];

const tableRows = [
    { id: 1, name: 'Standard table', status: 'Ready', owner: 'AppKu' },
    { id: 2, name: 'Editable grid', status: 'Ready', owner: 'AppKu' }
];

const tableColumns = [
    {
        title: 'Name',
        dataIndex: 'name'
    },
    {
        title: 'Status',
        dataIndex: 'status'
    },
    {
        title: 'Owner',
        dataIndex: 'owner'
    }
];

const sheetColumnDefs = [
    {
        field: 'active',
        headerName: 'Active',
        cellDataType: 'boolean'
    },
    {
        field: 'name',
        headerName: 'Name'
    },
    {
        field: 'notes',
        headerName: 'Notes',
        flex: 1
    }
];

const workbookColumns = [
    {
        field: 'sku',
        headerName: 'SKU'
    },
    {
        field: 'description',
        headerName: 'Description',
        flex: 1
    },
    {
        field: 'quantity',
        headerName: 'Quantity',
        cellDataType: 'number'
    }
];

/**
 * Renders the component library smoke app.
 */
function App () {
    const [ rows, setRows ] = useState([
        { active: true, name: 'Paste from Excel', notes: 'Use for heavy editable workflows.' },
        { active: false, name: 'Standard table', notes: 'Use AntD table for display workflows.' }
    ]);
    const [ workbookSheets, setWorkbookSheets ] = useState([
        {
            key: 'orders',
            title: 'Orders',
            columnDefs: workbookColumns,
            rowData: [
                { sku: '10001', description: 'Starter kit', quantity: 12 },
                { sku: '10002', description: 'Refill pack', quantity: 36 }
            ]
        },
        {
            key: 'returns',
            title: 'Returns',
            columnDefs: workbookColumns,
            rowData: [
                { sku: '10003', description: 'Damaged item', quantity: 2 },
                { sku: '10004', description: 'Customer return', quantity: 5 }
            ]
        }
    ]);

    function handleGridChange (event) {
        const nextRows = [];
        event.api.forEachNode((node) => {
            nextRows.push(node.data);
        });
        setRows(nextRows);
    }

    return (
        <AppKuProvider>
            <PageShell
                title="AppKu Components"
                actions={(
                    <AppKuButton
                        type="primary"
                        onClick={() => appKuToaster.show('Ant Design and editable grid components are wired.', 'success')}
                    >
                        Toast
                    </AppKuButton>
                )}
            >
                <Toolbar
                    start={<AppKuButton type="primary">Create</AppKuButton>}
                    end={<Input.Search placeholder="Search components" />}
                />

                <div className="storybook-grid">
                    <AppKuCard>
                        <h2>Form Controls</h2>
                        <FormRow label="Environment">
                            <AppKuSelect
                                items={environments}
                                value="staging"
                                valueField="id"
                                displayField="label"
                                onChange={() => {}}
                            />
                        </FormRow>
                    </AppKuCard>

                    <AppKuCard>
                        <h2>States</h2>
                        <div className="storybook-state-box">
                            <LoadingOverlay inline label="Loading preview" />
                        </div>
                    </AppKuCard>

                    <AppKuCard className="storybook-wide">
                        <h2>Display Table</h2>
                        <AppKuTable
                            columns={tableColumns}
                            dataSource={tableRows}
                            pagination={false}
                        />
                    </AppKuCard>

                    <AppKuCard className="storybook-wide">
                        <h2>Editable Sheet Grid</h2>
                        <AppKuEditableGrid
                            rowData={rows}
                            columnDefs={sheetColumnDefs}
                            onCellValueChanged={handleGridChange}
                        />
                    </AppKuCard>

                    <AppKuCard className="storybook-wide">
                        <h2>Workbook</h2>
                        <AppKuWorkbook
                            fileName="appku-workbook"
                            sheets={workbookSheets}
                            onSheetsChange={setWorkbookSheets}
                        />
                    </AppKuCard>
                </div>
            </PageShell>
        </AppKuProvider>
    );
}

export default App;
