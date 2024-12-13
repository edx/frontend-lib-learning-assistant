import { v4 as uuidv4 } from 'uuid';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { fetchLearningAssistantChatSummary } from './api';

import { addChatMessage, getLearningAssistantChatSummary } from './thunks';

jest.mock('./api');
jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));
const userId = 5;
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn().mockReturnValue({ userId }),
}));

const mockState = {
  learningAssistant: { messageList: [], conversationId: uuidv4() },
};

describe('Thunks unit tests', () => {
  const dispatch = jest.fn();
  const getState = jest.fn().mockReturnValue(mockState);

  afterEach(() => jest.resetAllMocks());

  describe('addChatMessage()', () => {
    const mockDate = new Date(2024, 1, 1);
    beforeAll(() => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(mockDate);
    });

    it('sends track event correctly, without content', async () => {
      const courseId = 'course-v1:edx+test+23';
      const role = 'user';
      const content = 'hello!';
      await addChatMessage(role, content, courseId)(dispatch, getState);

      const eventName = 'edx.ui.lms.learning_assistant.message';
      const properties = {
        course_id: courseId,
        id: mockState.learningAssistant.conversationId,
        role,
        timestamp: mockDate.toString(),
        user_id: userId,
      };
      expect(sendTrackEvent).toHaveBeenCalledWith(
        eventName,
        properties,
      );
    });
  });

  describe('getLearningAssistantChatSummary()', () => {
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

      fetchLearningAssistantChatSummary.mockResolvedValue(apiResponse);

      await getLearningAssistantChatSummary(courseId)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: 'learning-assistant/setApiIsLoading',
        payload: true,
      });

      expect(fetchLearningAssistantChatSummary).toHaveBeenCalledWith(courseId);

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

      fetchLearningAssistantChatSummary.mockResolvedValue(apiResponse);

      await getLearningAssistantChatSummary(courseId)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: 'learning-assistant/setApiIsLoading',
        payload: true,
      });

      expect(fetchLearningAssistantChatSummary).toHaveBeenCalledWith(courseId);

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

      fetchLearningAssistantChatSummary.mockResolvedValue(apiResponse);

      await getLearningAssistantChatSummary(courseId)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: 'learning-assistant/setApiIsLoading',
        payload: true,
      });

      expect(fetchLearningAssistantChatSummary).toHaveBeenCalledWith(courseId);

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
      fetchLearningAssistantChatSummary.mockRejectedValue('Whoopsie!');

      await getLearningAssistantChatSummary(courseId)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: 'learning-assistant/setApiIsLoading',
        payload: true,
      });

      expect(fetchLearningAssistantChatSummary).toHaveBeenCalledWith(courseId);

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
