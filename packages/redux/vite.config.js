import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: path.join(__dirname, 'test'),
  server: {
    port: 5052
  },
  alias: {
    '@indexeddb-tools/indexeddb': path.join(__dirname, '../indexeddb/src/index.ts')
  }
});