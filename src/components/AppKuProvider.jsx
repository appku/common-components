import ConfigProvider from 'antd/es/config-provider';

import '../styles/styles.css';

/**
 * Provides AppKu shared styling and Ant Design configuration.
 */
export function AppKuProvider ({ children, className, theme }) {
    const classes = [
        'appku-provider',
        className
    ].filter(Boolean).join(' ');

    return (
        <ConfigProvider theme={theme}>
            <div className={classes}>{children}</div>
        </ConfigProvider>
    );
}
