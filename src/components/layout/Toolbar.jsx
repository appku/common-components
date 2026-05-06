/**
 * Renders a two-sided action toolbar.
 */
export function Toolbar ({ start, end, className }) {
    const classes = [
        'appku-toolbar',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            <div className="appku-toolbar__group">{start}</div>
            <div className="appku-toolbar__group">{end}</div>
        </div>
    );
}
