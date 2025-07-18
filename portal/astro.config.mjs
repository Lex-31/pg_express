// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'http://172.22.1.106/portal',
    server: {
        port: 4000,
    },
    build: {
        format: 'file',
    },
});
