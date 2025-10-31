import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude all node_modules and dist folders from the search
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
