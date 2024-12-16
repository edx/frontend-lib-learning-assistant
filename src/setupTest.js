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
