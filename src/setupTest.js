import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';

jest.mock(
  '@optimizely/react-sdk',
  () => {
    const originalModule = jest.requireActual('@optimizely/react-sdk');
    return {
      __esModule: true,
      ...originalModule,
      useDecision: jest.fn(() => [{ enabled: true, variationKey: 'control' }]),
    };
  },
  { virtual: true },
);
