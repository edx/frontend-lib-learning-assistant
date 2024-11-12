import { fetchLearningAssistantMessageHistory } from './api';

import { getLearningAssistantMessageHistory } from './thunks';

jest.mock('./api');

describe('Thunks unit tests', () => {
  const dispatch = jest.fn();

  afterEach(() => jest.resetAllMocks());

  describe('getLearningAssistantMessageHistory()', () => {
    const fakeCourseId = 'course-v1:edx+test+23';

    describe('when returning results', () => {
      const apiResponse = [
        {
          role: 'user',
          content: 'Marco',
          timestamp: '2024-11-04T19:05:07.403363Z',
        },
        {
          role: 'assistant',
          content: 'Polo',
          timestamp: '2024-11-04T19:05:21.357636Z',
        },
      ];

      beforeEach(() => {
        fetchLearningAssistantMessageHistory.mockResolvedValue(apiResponse);
      });

      it('should set the loading state, fetch, parse and set the messages and remove the loading state', async () => {
        await getLearningAssistantMessageHistory(fakeCourseId)(dispatch);

        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'learning-assistant/setApiIsLoading',
          payload: true,
        });

        expect(fetchLearningAssistantMessageHistory).toHaveBeenCalledWith(fakeCourseId);

        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'learning-assistant/setMessageList',
          payload: {
            messageList: apiResponse.map(({ timestamp, ...msg }) => ({
              ...msg,
              timestamp: new Date(timestamp), // Parse ISO time to Date()
            })),
          },
        });

        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: 'learning-assistant/setDisclosureAcknowledged',
          payload: true,
        });

        expect(dispatch).toHaveBeenNthCalledWith(4, {
          type: 'learning-assistant/setApiIsLoading',
          payload: false,
        });
      });
    });

    describe('when returning no messages', () => {
      const apiResponse = [];

      beforeEach(() => {
        fetchLearningAssistantMessageHistory.mockResolvedValue(apiResponse);
      });

      it('should only set and remove the loading state', async () => {
        await getLearningAssistantMessageHistory(fakeCourseId)(dispatch);

        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'learning-assistant/setApiIsLoading',
          payload: true,
        });

        expect(fetchLearningAssistantMessageHistory).toHaveBeenCalledWith(fakeCourseId);

        expect(dispatch).not.toHaveBeenCalledWith(
          expect.objectContaining({ type: 'learning-assistant/setMessageList' }),
        );

        expect(dispatch).not.toHaveBeenCalledWith(
          expect.objectContaining({ type: 'learning-assistant/setDisclosureAcknowledged' }),
        );

        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'learning-assistant/setApiIsLoading',
          payload: false,
        });
      });
    });

    describe('when throwing on fetching', () => {
      beforeEach(() => {
        fetchLearningAssistantMessageHistory.mockRejectedValue('Whoopsie!');
      });

      it('should only set and remove the loading state', async () => {
        await getLearningAssistantMessageHistory(fakeCourseId)(dispatch);

        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'learning-assistant/setApiIsLoading',
          payload: true,
        });

        expect(fetchLearningAssistantMessageHistory).toHaveBeenCalledWith(fakeCourseId);

        expect(dispatch).not.toHaveBeenCalledWith(
          expect.objectContaining({ type: 'learning-assistant/setMessageList' }),
        );

        expect(dispatch).not.toHaveBeenCalledWith(
          expect.objectContaining({ type: 'learning-assistant/setDisclosureAcknowledged' }),
        );

        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'learning-assistant/setApiIsLoading',
          payload: false,
        });
      });
    });
  });
});
