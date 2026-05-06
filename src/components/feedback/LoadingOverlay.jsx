import Spin from 'antd/es/spin';

/**
 * Renders a shared loading indicator for blocking or inline states.
 */
export function LoadingOverlay ({ show = true, inline = false, label = 'Loading' }) {
    if (!show) {
        return null;
    }

    const classes = [
        'appku-loading-overlay',
        inline ? 'appku-loading-overlay--inline' : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} aria-live="polite" aria-label={label}>
            <Spin />
        </div>
    );
}
