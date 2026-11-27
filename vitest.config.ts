import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: [
      { find: /^@\/components\/(.*)/, replacement: path.resolve(__dirname, './src/frontend/components/$1') },
      { find: /^@\/data\/(.*)/, replacement: path.resolve(__dirname, './src/frontend/data/$1') },
      { find: /^@\/actions\/(.*)/, replacement: path.resolve(__dirname, './src/backend/actions/$1') },
      { find: /^@\/db$/, replacement: path.resolve(__dirname, './src/backend/db/index.ts') },
      { find: /^@\/db\/(.*)/, replacement: path.resolve(__dirname, './src/backend/db/$1') },
      { find: /^@\/server$/, replacement: path.resolve(__dirname, './src/backend/server/index.ts') },
      { find: /^@\/server\/(.*)/, replacement: path.resolve(__dirname, './src/backend/server/$1') },
      { find: /^@\/lib\/(.*)/, replacement: path.resolve(__dirname, './src/backend/lib/$1') },
      { find: /^@\/frontend\/(.*)/, replacement: path.resolve(__dirname, './src/frontend/$1') },
      { find: /^@\/backend\/(.*)/, replacement: path.resolve(__dirname, './src/backend/$1') },
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, './src/$1') },
    ],
  },
});
