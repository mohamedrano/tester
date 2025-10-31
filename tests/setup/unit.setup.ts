// Global setup for unit tests
// This file is used to configure mocks, stubs, and other test environment settings.

import { vi } from 'vitest';
import fc from 'fast-check';
import { mock, instance } from 'ts-mockito';

// Smoke test to ensure libraries are imported correctly.
console.log('Successfully imported fast-check:', !!fc);
console.log('Successfully imported ts-mockito:', !!mock && !!instance);

// --- Global Mocks ---
// Example: Mock a global function or module
// vi.mock('some-module', () => ({
//   ...
// }));

console.log('Unit test environment setup complete.');
