import { getConfig } from '@edx/frontend-platform';

import { getOptimizely } from './optimizely';

const originalConfig = jest.requireActual('@edx/frontend-platform').getConfig();
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));

getConfig.mockImplementation(() => originalConfig);

describe('Optimizely', () => {
  test('getOptimizely returns null when OPTIMIZELY_FULL_STACK_SDK_KEY config variable is missing', () => {
    getConfig.mockImplementation(() => ({}));
    expect(getOptimizely()).toEqual(null);
  });

  test('getOptimizely returns null when OPTIMIZELY_FULL_STACK_SDK_KEY config variable is available', () => {
    getConfig.mockImplementation(() => originalConfig);
    expect(getOptimizely()).not.toEqual(null);
  });
});
