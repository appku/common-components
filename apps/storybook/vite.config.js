import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Groups heavy demo dependencies into readable vendor chunks.
 */
function manualChunks (id) {
    if (!id.includes('/node_modules/')) {
        return undefined;
    }

    if (id.includes('/node_modules/exceljs/')) {
        return 'excel-vendor';
    }

    if (id.includes('/node_modules/ag-grid-community/') || id.includes('/node_modules/ag-grid-react/')) {
        return 'ag-grid-vendor';
    }

    if (
        id.includes('/node_modules/antd/')
        || id.includes('/node_modules/@ant-design/')
        || id.includes('/node_modules/@rc-component/')
        || id.includes('/node_modules/rc-')
    ) {
        return 'antd-vendor';
    }

    if (
        id.includes('/node_modules/react/')
        || id.includes('/node_modules/react-dom/')
        || id.includes('/node_modules/scheduler/')
    ) {
        return 'react-vendor';
    }

    return 'vendor';
}

export default defineConfig({
    plugins: [ react() ],
    build: {
        rollupOptions: {
            output: {
                manualChunks
            }
        }
    },
    server: {
        port: 5173
    }
});
