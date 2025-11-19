import type {Meta, StoryObj} from '@storybook/react';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import Grid from './grid.tsx';

// Added IndeterminateCheckbox component
function IndeterminateCheckbox(
    {
        indeterminate,
        ...rest
    }: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current && typeof indeterminate === 'boolean') {
            ref.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return <input type="checkbox" ref={ref} {...rest} />;
}

// Sample data generator
const generateSampleData = (count: number) => {
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const statuses = ['Active', 'Inactive', 'Pending'];

    return Array.from({length: count}, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        department: departments[i % departments.length],
        salary: Math.floor(50000 + Math.random() * 100000),
        status: statuses[i % statuses.length],
        joinDate: new Date(
            2020 + Math.floor(Math.random() * 5),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28)
        )
            .toISOString()
            .split('T')[0],
    }));
};

const basicColumns = [
    {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        enableSorting: true,
        enableColumnFilter: true,
    },
    {
        accessorKey: 'email',
        header: 'Email',
        size: 250,
        enableSorting: true,
        enableColumnFilter: true,
    },
    {
        accessorKey: 'department',
        header: 'Department',
        size: 150,
        enableSorting: true,
        enableColumnFilter: true,
    },
    {
        accessorKey: 'salary',
        header: 'Salary',
        size: 150,
        enableSorting: true,
        cell: (info: any) => `$${info.getValue().toLocaleString()}`,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        enableSorting: true,
        cell: (info: any) => {
            const status = info.getValue();
            const colors: Record<string, string> = {
                Active: '#10b981',
                Inactive: '#ef4444',
                Pending: '#f59e0b',
            };
            return (
                <span
                    style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: `${colors[status]}20`,
                        color: colors[status],
                    }}
                >
          {status}
        </span>
            );
        },
    },
    {
        accessorKey: 'joinDate',
        header: 'Join Date',
        size: 150,
        enableSorting: true,
    },
];

// Meta configuration
const meta: Meta<typeof Grid> = {
    title: 'Components/Grid',
    component: Grid,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'A powerful, feature-rich data grid component built with @tanstack/react-table. Supports sorting, filtering, pagination, row selection, cell editing, grouping, and more.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        data: {
            description: 'Array of data objects to display in the grid',
            control: false,
        },
        columns: {
            description: 'Column definitions array',
            control: false,
        },
        loading: {
            description: 'Show loading state',
            control: 'boolean',
        },
        editable: {
            description: 'Enable cell editing',
            control: 'boolean',
        },
        rowSelectionMode: {
            description: 'Row selection mode',
            control: 'select',
            options: ['none', 'single', 'multiple'],
        },
        paginationMode: {
            description: 'Pagination mode',
            control: 'select',
            options: ['client', 'server'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story 1: Basic Grid
export const Basic: Story = {
    args: {},
    render: () => {
        const data = useMemo(() => generateSampleData(50), []);

        return (
            <div style={{padding: '20px', height: '100vh', boxSizing: 'border-box'}}>
                <h1 style={{marginTop: 0}}>Basic Grid</h1>
                <p>A simple grid with sorting, filtering, and pagination.</p>
                <Grid
                    data={data}
                    columns={basicColumns}
                    getRowId={(row) => row.id}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Basic grid with all core features: sorting, filtering, and pagination. Click column headers to sort, use the filter button to show column filters.',
            },
        },
    },
};

// Story 2: Row Selection
export const RowSelection: Story = {
    render: () => {
        const data = useMemo(() => generateSampleData(30), []);
        const [selected, setSelected] = useState<string[]>([]);

        const columnsWithCheckbox = useMemo(
            () => [
                {
                    id: 'select',
                    size: 50,
                    enableResizing: false,
                    header: ({ table }: any) => (
                        <IndeterminateCheckbox
                            checked={table.getIsAllRowsSelected()}
                            indeterminate={table.getIsSomeRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                        />
                    ),
                    cell: ({ row }: any) => (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <input
                                type="checkbox"
                                checked={row.getIsSelected()}
                                disabled={!row.getCanSelect()}
                                onChange={row.getToggleSelectedHandler()}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    ),
                },
                ...basicColumns,
            ],
            []
        );

        return (
            <div style={{ padding: '20px', height: '100vh', boxSizing: 'border-box' }}>
                <h1>Row Selection</h1>
                <p>Selected IDs: {selected.join(', ') || 'None'}</p>
                <Grid
                    data={data}
                    columns={columnsWithCheckbox}
                    getRowId={(row) => row.id}
                    rowSelectionMode="multiple"
                    selectedRowIds={selected}
                    onRowSelectionChange={(ids) => setSelected(ids)}
                />
            </div>
        );
    },
};
// Story 3: Editable Grid
export const Editable: Story = {
    args: {},
    render: () => {
        const [data, setData] = useState(() => generateSampleData(20));

        const handleCellEdit = ({rowId, columnId, value}: any) => {
            setData((prev) =>
                prev.map((row) => (row.id === rowId ? {...row, [columnId]: value} : row))
            );
        };

        return (
            <div style={{padding: '20px', height: '100vh', boxSizing: 'border-box'}}>
                <h1 style={{marginTop: 0}}>Editable Grid</h1>
                <p>Double-click cells to edit. Press Enter to save, Escape to cancel.</p>
                <div
                    style={{
                        marginBottom: '16px',
                        padding: '12px',
                        background: '#fef3c7',
                        borderRadius: '6px',
                        border: '1px solid #fde68a',
                    }}
                >
                    <strong>💡 Tip:</strong> Try double-clicking on any cell to edit its value. Changes are saved
                    immediately.
                </div>
                <Grid
                    data={data}
                    columns={basicColumns}
                    getRowId={(row) => row.id}
                    editable
                    onCellEditCommit={handleCellEdit}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Grid with editable cells. Double-click any cell to enter edit mode, press Enter to commit changes or Escape to cancel.',
            },
        },
    },
};

// Story 4: Grouped Data
export const Grouped: Story = {
    args: {},
    render: () => {
        const data = useMemo(() => generateSampleData(50), []);

        const groupedColumns = useMemo(
            () => [
                {
                    accessorKey: 'department',
                    header: 'Department',
                    size: 200,
                    enableGrouping: true,
                },
                ...basicColumns.filter((col) => col.accessorKey !== 'department'),
            ],
            []
        );

        return (
            <div style={{padding: '20px', height: '100vh', boxSizing: 'border-box'}}>
                <h1 style={{marginTop: 0}}>Grouped Data</h1>
                <p>Data grouped by department with expand/collapse functionality.</p>
                <div
                    style={{
                        marginBottom: '16px',
                        padding: '12px',
                        background: '#f0fdf4',
                        borderRadius: '6px',
                        border: '1px solid #bbf7d0',
                    }}
                >
                    <strong>✨ Feature:</strong> Click the expand/collapse icons to show or hide department groups.
                </div>
                <Grid
                    data={data}
                    columns={groupedColumns}
                    getRowId={(row) => row.id}
                    groupBy={['department']}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates row grouping by department. Click the chevron icons to expand or collapse groups.',
            },
        },
    },
};

// Story 5: Large Dataset
export const LargeDataset: Story = {
    render: () => {
        // Increased to 5,000 to demonstrate virtualization performance
        const data = useMemo(() => generateSampleData(5000), []);

        return (
            <div style={{ padding: '20px', height: '100vh', boxSizing: 'border-box' }}>
                <h1>Large Dataset (5,000 rows)</h1>
                <p>Virtualization ensures 60fps scrolling.</p>
                <Grid
                    data={data}
                    columns={basicColumns}
                    getRowId={(row) => row.id}
                    height="700px"
                    pageSize={1000}
                />
            </div>
        );
    },
};
// Story 6: Loading State
export const Loading: Story = {
    args: {},
    render: () => {
        const data = useMemo(() => generateSampleData(20), []);

        return (
            <div style={{padding: '20px', height: '100vh', boxSizing: 'border-box'}}>
                <h1 style={{marginTop: 0}}>Loading State</h1>
                <p>Demonstrates the loading indicator in the toolbar.</p>
                <Grid
                    data={data}
                    columns={basicColumns}
                    getRowId={(row) => row.id}
                    loading={true}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows the loading state indicator that appears in the toolbar while data is being fetched.',
            },
        },
    },
};

// Story 7: Error State
export const ErrorState: Story = {
    args: {},
    render: () => {
        const data = useMemo(() => generateSampleData(20), []);

        return (
            <div style={{padding: '20px', height: '100vh', boxSizing: 'border-box'}}>
                <h1 style={{marginTop: 0}}>Error State</h1>
                <p>Demonstrates error handling and error message display.</p>
                <Grid
                    data={data}
                    columns={basicColumns}
                    getRowId={(row) => row.id}
                    error="Failed to load data. Please try again later."
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows how errors are displayed to users when data fetching fails.',
            },
        },
    },
};

// Story 8: Empty State
export const Empty: Story = {
    args: {},
    render: () => {
        return (
            <div style={{padding: '20px', height: '100vh', boxSizing: 'border-box'}}>
                <h1 style={{marginTop: 0}}>Empty State</h1>
                <p>Grid with no data displays a friendly empty state message.</p>
                <Grid
                    data={[]}
                    columns={basicColumns}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows the empty state when no data is available.',
            },
        },
    },
};

// Story 9: Custom Height
export const CustomHeight: Story = {
    args: {},
    render: () => {
        const data = useMemo(() => generateSampleData(100), []);

        return (
            <div style={{padding: '20px', height: '100vh', boxSizing: 'border-box'}}>
                <h1 style={{marginTop: 0}}>Custom Height</h1>
                <p>Grid with custom height set to 400px.</p>
                <Grid
                    data={data}
                    columns={basicColumns}
                    getRowId={(row) => row.id}
                    height="400px"
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates setting a custom height for the grid container.',
            },
        },
    },
};

// Story 10: Grid Styling
export const GridStyling: Story = {
    render: () => {
        const data = useMemo(() => generateSampleData(50), []);
        const [lines, setLines] = useState<'none' | 'horizontal' | 'vertical' | 'both'>('both');
        const [striped, setStriped] = useState(true);

        return (
            <div style={{ padding: '20px', height: '100vh', boxSizing: 'border-box' }}>
                <h1>Grid Styling</h1>
                <div style={{ marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center' }}>
                    <label>
                        <strong>Grid Lines: </strong>
                        <select value={lines} onChange={(e) => setLines(e.target.value as any)}>
                            <option value="none">None</option>
                            <option value="horizontal">Horizontal Only</option>
                            <option value="vertical">Vertical Only</option>
                            <option value="both">Both</option>
                        </select>
                    </label>
                    <label>
                        <input type="checkbox" checked={striped} onChange={e => setStriped(e.target.checked)} />
                        <strong> Striped Rows</strong>
                    </label>
                </div>

                <Grid
                    data={data}
                    columns={basicColumns}
                    getRowId={(row) => row.id}
                    gridLines={lines}
                    striped={striped}
                />
            </div>
        );
    },
};

// Story 11: All Features Combined
export const AllFeatures: Story = {
    args: {},
    render: () => {
        const [data, setData] = useState(() => generateSampleData(100));
        const [selected, setSelected] = useState<string[]>([]);

        const handleCellEdit = ({rowId, columnId, value}: any) => {
            setData((prev) =>
                prev.map((row) => (row.id === rowId ? {...row, [columnId]: value} : row))
            );
        };

        const columnsWithCheckbox = useMemo(
            () => [
                {
                    id: 'select',
                    header: ({table}: any) => (
                        <IndeterminateCheckbox
                            checked={table.getIsAllRowsSelected()}
                            indeterminate={table.getIsSomeRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                        />
                    ),
                    cell: ({row}: any) => (
                        <input
                            type="checkbox"
                            checked={row.getIsSelected()}
                            disabled={!row.getCanSelect()}
                            onChange={row.getToggleSelectedHandler()}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ),
                    size: 50,
                },
                ...basicColumns,
            ],
            []
        );

        return (
            <div style={{padding: '20px', height: '100vh', boxSizing: 'border-box'}}>
                <h1 style={{marginTop: 0}}>All Features Combined</h1>
                <p>A comprehensive demonstration with selection, editing, filtering, sorting, and export.</p>
                <div
                    style={{
                        marginBottom: '16px',
                        padding: '12px',
                        background: '#ede9fe',
                        borderRadius: '6px',
                        border: '1px solid #ddd6fe',
                    }}
                >
                    <strong>🎯 Full Featured:</strong> {selected.length} rows selected • Try editing, filtering, sorting,
                    and exporting
                </div>
                <Grid
                    data={data}
                    columns={columnsWithCheckbox}
                    getRowId={(row) => row.id}
                    rowSelectionMode="multiple"
                    selectedRowIds={selected}
                    onRowSelectionChange={(ids) => setSelected(ids)}
                    editable
                    onCellEditCommit={handleCellEdit}
                    onExportRequest={(format) => alert(`Exporting as ${format.toUpperCase()}`)}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Complete demonstration combining all grid features: selection, editing, filtering, sorting, pagination, and export.',
            },
        },
    },
};
