import { fetchLearningAssistantSummary } from './api';

import { getLearningAssistantSummary } from './thunks';

jest.mock('./api');

describe('Thunks unit tests', () => {
  const dispatch = jest.fn();

  afterEach(() => jest.resetAllMocks());

  describe('getLearningAssistantSummary()', () => {
    const courseId = 'course-v1:edx+test+23';

    it('with message_history and audit_trial data returned, call all expected dispatches', async () => {
      const apiResponse = {
        enabled: true,
        message_history: [
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
        ],
        audit_trial: {
          start_date: '2024-12-02T14:59:16.148236Z',
          expiration_date: '9999-12-16T14:59:16.148236Z',
        },
      };

      fetchLearningAssistantSummary.mockResolvedValue(apiResponse);

      await getLearningAssistantSummary(courseId)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: 'learning-assistant/setApiIsLoading',
        payload: true,
      });

      expect(fetchLearningAssistantSummary).toHaveBeenCalledWith(courseId);

      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: 'learning-assistant/setIsEnabled',
        payload: true,
      });

      expect(dispatch).toHaveBeenNthCalledWith(3, {
        type: 'learning-assistant/setMessageList',
        payload: {
          messageList: apiResponse.message_history.map(({ timestamp, ...msg }) => ({
            ...msg,
            timestamp: new Date(timestamp).toString(), // Parse ISO time to Date()
          })),
        },
      });

      expect(dispatch).toHaveBeenNthCalledWith(4, {
        type: 'learning-assistant/setDisclosureAcknowledged',
        payload: true,
      });

      expect(dispatch).toHaveBeenNthCalledWith(5, {
        type: 'learning-assistant/setAuditTrial',
        payload: {
          start_date: '2024-12-02T14:59:16.148236Z',
          expiration_date: '9999-12-16T14:59:16.148236Z',
        },
      });

      expect(dispatch).toHaveBeenNthCalledWith(6, {
        type: 'learning-assistant/setApiIsLoading',
        payload: false,
      });
    });

    it('with no message_history data returned, do not call message history related dispatches', async () => {
      const apiResponse = {
        enabled: true,
        message_history: [],
        audit_trial: {
          start_date: '2024-12-02T14:59:16.148236Z',
          expiration_date: '9999-12-16T14:59:16.148236Z',
        },
      };

      fetchLearningAssistantSummary.mockResolvedValue(apiResponse);

      await getLearningAssistantSummary(courseId)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: 'learning-assistant/setApiIsLoading',
        payload: true,
      });

      expect(fetchLearningAssistantSummary).toHaveBeenCalledWith(courseId);

      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: 'learning-assistant/setIsEnabled',
        payload: true,
      });

      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'learning-assistant/setMessageList' }),
      );

      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'learning-assistant/setDisclosureAcknowledged' }),
      );

      expect(dispatch).toHaveBeenNthCalledWith(3, {
        type: 'learning-assistant/setAuditTrial',
        payload: {
          start_date: '2024-12-02T14:59:16.148236Z',
          expiration_date: '9999-12-16T14:59:16.148236Z',
        },
      });

      expect(dispatch).toHaveBeenNthCalledWith(4, {
        type: 'learning-assistant/setApiIsLoading',
        payload: false,
      });
    });

    it('with no audit_trial data returned, do not call audit trial dispatch', async () => {
      const apiResponse = {
        enabled: true,
        message_history: [
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
        ],
        audit_trial: {},
      };

      fetchLearningAssistantSummary.mockResolvedValue(apiResponse);

      await getLearningAssistantSummary(courseId)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: 'learning-assistant/setApiIsLoading',
        payload: true,
      });

      expect(fetchLearningAssistantSummary).toHaveBeenCalledWith(courseId);

      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: 'learning-assistant/setIsEnabled',
        payload: true,
      });

      expect(dispatch).toHaveBeenNthCalledWith(3, {
        type: 'learning-assistant/setMessageList',
        payload: {
          messageList: apiResponse.message_history.map(({ timestamp, ...msg }) => ({
            ...msg,
            timestamp: new Date(timestamp).toString(), // Parse ISO time to Date()
          })),
        },
      });

      expect(dispatch).toHaveBeenNthCalledWith(4, {
        type: 'learning-assistant/setDisclosureAcknowledged',
        payload: true,
      });

      expect(dispatch).toHaveBeenNthCalledWith(5, {
        type: 'learning-assistant/setApiIsLoading',
        payload: false,
      });
    });

    it('when throwing on fetching, should set the loading state and throw error', async () => {
      fetchLearningAssistantSummary.mockRejectedValue('Whoopsie!');

      await getLearningAssistantSummary(courseId)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: 'learning-assistant/setApiIsLoading',
        payload: true,
      });

      expect(fetchLearningAssistantSummary).toHaveBeenCalledWith(courseId);

      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'learning-assistant/setMessageList' }),
      );

      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'learning-assistant/setDisclosureAcknowledged' }),
      );

      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: 'learning-assistant/setApiError',
        // payload: false,
      });
    });
  });
});
