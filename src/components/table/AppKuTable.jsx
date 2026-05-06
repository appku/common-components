import { Table } from 'antd';

/**
 * Renders the standard AppKu display table.
 */
export function AppKuTable ({
    rowKey = 'id',
    size = 'middle',
    pagination = {
        showSizeChanger: true
    },
    ...props
}) {
    return (
        <Table
            rowKey={rowKey}
            size={size}
            pagination={pagination}
            {...props}
        />
    );
}
