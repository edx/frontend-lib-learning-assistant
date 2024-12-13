import '@testing-library/jest-dom';
import { mergeConfig } from '@edx/frontend-platform';

mergeConfig({
  ...process.env,
});

const mockModelStore = {};
jest.mock(
  '@src/generic/model-store',
  () => ({
    useModel: jest.fn((type) => mockModelStore[type]),
    setModel: jest.fn((type, data) => {
      mockModelStore[type] = data;
    }),
  }),
  { virtual: true },
);
