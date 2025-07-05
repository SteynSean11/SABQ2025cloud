import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the global fetch function
window.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      candidates: [{
        content: {
          parts: [{ text: 'Mocked AI Response' }]
        }
      }]
    }),
  })
) as any;
