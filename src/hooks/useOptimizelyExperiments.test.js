import { renderHook } from '@testing-library/react-hooks';
// import { useDispatch } from 'react-redux';
import { useDecision } from '@optimizely/react-sdk';
import { setExperiments } from '../data/slice';

import useOptimizelyExperiment from './useOptimizelyExperiments';

const optimizelyFlag = 'some-optimizely-flag';
const userId = 123;
const mockedDecision = { active: true, variationKey: 'test-key' };

jest.mock('../data/optimizely', () => ({}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('@optimizely/react-sdk', () => ({
  useDecision: jest.fn(() => ([mockedDecision])),
}));

jest.mock('../data/slice', () => ({
  setExperiment: jest.fn(),
}));

jest.mock(
  '@edx/frontend-platform/auth',
  () => ({
    getAuthenticatedUser: jest.fn(() => ({
      userId,
    })),
  }),
  { virtual: true },
);

describe('useOptimizelyExperiment()', () => {
  describe('on normal behavior', () => {
    beforeEach(() => {
      renderHook(() => useOptimizelyExperiment(optimizelyFlag));
    });

    it('should call useDecision() with the expected parameters', () => {
      expect(useDecision).toHaveBeenCalledWith(optimizelyFlag, { autoUpdate: true }, { id: userId.toString() });
    });

    it('should call setExperiment() with the expected parameters', () => {
      renderHook(() => useOptimizelyExperiment(optimizelyFlag));
      expect(setExperiments).toHaveBeenCalledWith({ flag: optimizelyFlag, ...mockedDecision });
    });
  });

  describe('if useDecision returns nothing', () => {
    beforeEach(() => {
      useDecision.mockImplementation(() => []);
      renderHook(() => useOptimizelyExperiment(optimizelyFlag));
    });

    it('should call setExperiment() with undefined flag and variationKey', () => {
      renderHook(() => useOptimizelyExperiment(optimizelyFlag));
      expect(setExperiments).toHaveBeenCalledWith({ flag: optimizelyFlag, active: undefined, variationKey: undefined });
    });
  });
});
