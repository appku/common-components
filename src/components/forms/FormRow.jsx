/**
 * Renders a compact label and control row for forms.
 */
export function FormRow ({ label, children, className }) {
    const classes = [
        'appku-form-row',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            <div className="appku-form-row__label">{label}</div>
            <div>{children}</div>
        </div>
    );
}
