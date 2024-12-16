import '@testing-library/jest-dom';
import { mergeConfig } from '@edx/frontend-platform';

jest.mock('./hooks', () => ({
  useCourseUpgrade: () => ({ upgradeable: false }),
  useTrackEvent: () => ({ track: () => {} }),
}));

jest.mock('@src/generic/model-store', () => ({ useModel: jest.fn() }), { virtual: true });

mergeConfig({
  ...process.env,
});

// const mockModelStore = {};
// jest.mock(
//   '@src/generic/model-store',
//   () => ({
//     useModel: jest.fn((type) => mockModelStore[type]),
//     setModel: jest.fn((type, data) => {
//       mockModelStore[type] = data;
//     }),
//   }),
//   { virtual: true },
// );
