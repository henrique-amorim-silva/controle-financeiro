import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

globalThis.alert = vi.fn();

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});