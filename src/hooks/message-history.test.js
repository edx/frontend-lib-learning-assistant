import { renderHook } from '@testing-library/react-hooks'; // eslint-disable-line import/no-unresolved

import { useSelector } from 'react-redux';
import { useMessageHistory } from './message-history';
import { getLearningAssistantMessageHistory } from '../data/thunks';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const getLearningAssistantMessageHistorySignature = { getLearningAssistantMessageHistory: 'getLearningAssistantMessageHistory' };
jest.mock('../data/thunks', () => ({
  getLearningAssistantMessageHistory: jest.fn().mockReturnValue(getLearningAssistantMessageHistorySignature),
}));

describe('Learning Assistant Message History Hooks', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('useMessageHistory()', () => {
    let hook;
    const fakeCourseId = 'course-v1:edx+test+23';

    const renderTestHook = (courseId, isEnabled) => {
      const mockedStoreState = { learningAssistant: { isEnabled } };
      useSelector.mockImplementation(selector => selector(mockedStoreState));
      hook = renderHook(() => useMessageHistory(courseId));
      return hook;
    };

    it('should dispatch getLearningAssistantMessageHistory() with the chat history', () => {
      renderTestHook(fakeCourseId, true);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(getLearningAssistantMessageHistorySignature);
      expect(getLearningAssistantMessageHistory).toHaveBeenCalledWith(fakeCourseId);
    });

    it('should NOT dispatch getLearningAssistantMessageHistory() when disabled', () => {
      renderTestHook(fakeCourseId, false);

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(getLearningAssistantMessageHistory).not.toHaveBeenCalled();
    });

    it('should NOT dispatch getLearningAssistantMessageHistory() with no courseId', () => {
      renderTestHook(null, true);

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(getLearningAssistantMessageHistory).not.toHaveBeenCalled();
    });
  });
});
