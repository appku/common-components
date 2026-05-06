import Select from 'antd/es/select';

/**
 * Converts a primitive or object item into an Ant Design select option.
 */
function toOption (item, valueField, displayField) {
    if (typeof item !== 'object' || item === null) {
        return {
            label: String(item),
            value: item
        };
    }

    const value = valueField ? item[valueField] : item.id;
    const label = displayField ? item[displayField] : item.label ?? item.title ?? item.name ?? value;

    return {
        ...item,
        label,
        value
    };
}

/**
 * Renders a select control with AppKu item mapping defaults.
 */
export function AppKuSelect ({
    items = [],
    valueField,
    displayField,
    options,
    showSearch = true,
    optionFilterProp = 'label',
    ...props
}) {
    const resolvedOptions = options ?? items.map((item) => toOption(item, valueField, displayField));

    return (
        <Select
            options={resolvedOptions}
            showSearch={showSearch}
            optionFilterProp={optionFilterProp}
            {...props}
        />
    );
}
