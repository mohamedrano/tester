import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Set the root to the current directory
    root: resolve(__dirname),
    // Look for test files only in the 'tests/unit' directory
    include: ['tests/unit/**/*.{test,spec}.ts'],
    // Exclude node_modules and dist folders from the search
    exclude: ['node_modules', 'dist'],
    // Use the global setup file
    setupFiles: [resolve(__dirname, '../../tests/setup/unit.setup.ts')],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['html', 'json', 'text'],
      // The directory where reports will be generated
      reportsDirectory: resolve(__dirname, '../../reports/unit/agent-framework-coverage'),
      // Include only the 'src' directory in the coverage report
      include: ['src/**/*.ts'],
      // Exclude test files and the main index file from coverage
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
      // Set the coverage threshold
      thresholds: {
        statements: 97,
        branches: 97,
        functions: 97,
        lines: 97,
      },
    },
  },
});
