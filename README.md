# AppKu Common Components

Shared React components for AppKu applications.

## Usage

Until this package is published to npm, consume the production branch as a Git dependency:

```json
{
    "dependencies": {
        "appku-common-components": "git+https://github.com/appku/common-components.git#production"
    }
}
```

Import the public package entrypoint and styles:

```jsx
import {
    AppKuProvider,
    AppKuTable,
    AppKuEditableGrid,
    AppKuButton
} from 'appku-common-components';
import 'appku-common-components/styles.css';
```

Generated starters use lightweight subpath imports for first-screen controls:

```jsx
import { AppKuButton } from 'appku-common-components/button';
import { AppKuCard } from 'appku-common-components/card';
import { AppKuProvider } from 'appku-common-components/provider';
```

Import grid styles only for screens that render `AppKuEditableGrid` or `AppKuWorkbook`:

```jsx
import 'appku-common-components/grid.css';
```

Do not import from `apps/storybook/src/*`; Storybook files are examples and prototypes.

## Stack

- ESM JavaScript and JSX for AppKu-owned code.
- React 19.
- Vite library build.
- Ant Design v6 for standard UI and mostly-display tables.
- AG Grid Community for heavy editable spreadsheet-style grids.

## Grid Guidance

- Use `AppKuTable` for read-heavy operational tables: sorting, filtering, pagination, row selection, fixed columns, expandable rows, and action menus.
- Use `AppKuEditableGrid` for spreadsheet-like data entry: cell editing, copy/paste from Excel or Google Sheets, row insertion/deletion, and keyboard-heavy workflows.
- Use `AppKuWorkbook` when a workflow needs multiple grid-backed sheets in tabs plus toolbar export.
- `AppKuWorkbook` exports the active sheet as CSV and all sheets as XLSX through the MIT-licensed `exceljs` package.

## Scripts

```bash
npm install
npm run check
```

The Git dependency uses `prepare` to build `dist/` during installation.

Storybook/Vite smoke app:

```bash
cd apps/storybook
npm install
npm run build
```
