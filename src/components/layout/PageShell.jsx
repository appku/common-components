/**
 * Renders the standard AppKu page frame with header actions.
 */
export function PageShell ({ title, actions, children, className }) {
    const classes = [
        'appku-page-shell',
        className
    ].filter(Boolean).join(' ');

    return (
        <main className={classes}>
            <header className="appku-page-shell__header">
                <h1 className="appku-page-shell__title">{title}</h1>
                {actions}
            </header>
            <section className="appku-page-shell__content">
                {children}
            </section>
        </main>
    );
}
