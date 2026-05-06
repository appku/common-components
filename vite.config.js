import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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
            external: [
                '@ant-design/icons',
                'ag-grid-community',
                'ag-grid-react',
                'antd',
                'antd/es',
                'exceljs',
                'react',
                'react-dom',
                'react/jsx-runtime'
            ]
        },
        sourcemap: true
    }
});
