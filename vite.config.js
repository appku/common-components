import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const externalPackages = [
    '@ant-design/icons',
    'ag-grid-community',
    'ag-grid-react',
    'antd',
    'exceljs',
    'react',
    'react-dom',
    'react/jsx-runtime'
];

/**
 * Keeps peer dependencies external in the library build.
 */
function isExternal (id) {
    return externalPackages.some((packageName) => id === packageName || id.startsWith(`${packageName}/`));
}

export default defineConfig({
    plugins: [ react() ],
    build: {
        lib: {
            entry: 'src/index.js',
            cssFileName: 'styles',
            formats: [
                'es',
                'cjs'
            ],
            fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs'
        },
        rollupOptions: {
            external: isExternal
        },
        sourcemap: true
    }
});
