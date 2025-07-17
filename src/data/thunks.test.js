import { v4 as uuidv4 } from 'uuid';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { fetchLearningAssistantChatSummary, fetchChatResponse } from './api';

import { addChatMessage, getLearningAssistantChatSummary, getChatResponse } from './thunks';

const userId = 5;

jest.mock('./api');
jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

const mockState = {
  learningAssistant: { messageList: [], conversationId: uuidv4() },
};

describe('Thunks unit tests', () => {
  const dispatch = jest.fn();
  const getState = jest.fn().mockReturnValue(mockState);

  beforeEach(() => {
    // Set up the mock for getAuthenticatedUser
    getAuthenticatedUser.mockReturnValue({ userId });
    // Reset and set up getState mock
    getState.mockReturnValue(mockState);
  });

  afterEach(() => {
    // Only reset mocks that we want to reset, not all mocks
    dispatch.mockClear();
    getState.mockClear();
    getAuthenticatedUser.mockClear();
    fetchLearningAssistantChatSummary.mockClear();
    fetchChatResponse.mockClear();
    sendTrackEvent.mockClear();
  });

  describe('addChatMessage()', () => {
    const mockDate = new Date(2024, 1, 1);

    beforeEach(async () => {
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

  describe('getChatResponse()', () => {
    const courseId = 'course-v1:edx+test+23';
    const unitId = 'unit123';
    const upgradeable = false;

    describe('when FEATURE_ENABLE_CHAT_V2_ENDPOINT is enabled', () => {
      beforeEach(() => {
        process.env.FEATURE_ENABLE_CHAT_V2_ENDPOINT = 'true';
      });

      afterEach(() => {
        delete process.env.FEATURE_ENABLE_CHAT_V2_ENDPOINT;
      });

      it('handles API response as array and dispatches addChatMessage for each message', async () => {
        const apiResponse = [
          { role: 'assistant', content: 'Hello!' },
          { role: 'assistant', content: 'How can I help?' },
        ];

        fetchChatResponse.mockResolvedValue(apiResponse);

        await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);

        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'learning-assistant/setApiIsLoading',
          payload: true,
        });

        expect(fetchChatResponse).toHaveBeenCalledWith(courseId, [], unitId, {});

        // Should dispatch addChatMessage for each message in the array
        expect(dispatch).toHaveBeenCalledWith(
          expect.any(Function), // addChatMessage thunk
        );

        expect(dispatch).toHaveBeenNthCalledWith(4, {
          type: 'learning-assistant/setApiIsLoading',
          payload: false,
        });
      });

      it('handles single message in array format', async () => {
        const apiResponse = [{ role: 'assistant', content: 'Single response' }];

        fetchChatResponse.mockResolvedValue(apiResponse);

        await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);

        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'learning-assistant/setApiIsLoading',
          payload: true,
        });

        expect(fetchChatResponse).toHaveBeenCalledWith(courseId, [], unitId, {});

        // Should dispatch addChatMessage once for the single message
        expect(dispatch).toHaveBeenCalledWith(
          expect.any(Function), // addChatMessage thunk
        );

        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: 'learning-assistant/setApiIsLoading',
          payload: false,
        });
      });
    });

    describe('when FEATURE_ENABLE_CHAT_V2_ENDPOINT is disabled', () => {
      beforeEach(() => {
        process.env.FEATURE_ENABLE_CHAT_V2_ENDPOINT = 'false';
      });

      afterEach(() => {
        delete process.env.FEATURE_ENABLE_CHAT_V2_ENDPOINT;
      });

      it('handles API response as single object and dispatches addChatMessage once', async () => {
        const apiResponse = { role: 'assistant', content: 'Single response' };

        fetchChatResponse.mockResolvedValue(apiResponse);

        await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);

        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'learning-assistant/setApiIsLoading',
          payload: true,
        });

        expect(fetchChatResponse).toHaveBeenCalledWith(courseId, [], unitId, {});

        // Should dispatch addChatMessage once for the single message
        expect(dispatch).toHaveBeenCalledWith(
          expect.any(Function), // addChatMessage thunk
        );

        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: 'learning-assistant/setApiIsLoading',
          payload: false,
        });
      });
    });

    describe('when FEATURE_ENABLE_CHAT_V2_ENDPOINT is not set', () => {
      beforeEach(() => {
        delete process.env.FEATURE_ENABLE_CHAT_V2_ENDPOINT;
      });

      it('defaults to legacy behavior and handles API response as single object', async () => {
        const apiResponse = { role: 'assistant', content: 'Default response' };

        fetchChatResponse.mockResolvedValue(apiResponse);

        await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);

        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'learning-assistant/setApiIsLoading',
          payload: true,
        });

        expect(fetchChatResponse).toHaveBeenCalledWith(courseId, [], unitId, {});

        // Should dispatch addChatMessage once for the single message
        expect(dispatch).toHaveBeenCalledWith(
          expect.any(Function), // addChatMessage thunk
        );

        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: 'learning-assistant/setApiIsLoading',
          payload: false,
        });
      });
    });

    it('handles API errors and dispatches setApiError', async () => {
      fetchChatResponse.mockRejectedValue(new Error('API Error'));

      await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);

      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: 'learning-assistant/setApiIsLoading',
        payload: true,
      });

      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: 'learning-assistant/setApiError',
      });

      expect(dispatch).toHaveBeenNthCalledWith(3, {
        type: 'learning-assistant/setApiIsLoading',
        payload: false,
      });
    });

    it('passes promptExperimentVariationKey to query params and addChatMessage', async () => {
      const promptExperimentVariationKey = 'variation_a';

      // Test with V2 endpoint enabled
      process.env.FEATURE_ENABLE_CHAT_V2_ENDPOINT = 'true';
      const apiResponse = [{ role: 'assistant', content: 'Test response' }];

      fetchChatResponse.mockResolvedValue(apiResponse);

      await getChatResponse(courseId, unitId, upgradeable, promptExperimentVariationKey)(dispatch, getState);

      expect(fetchChatResponse).toHaveBeenCalledWith(
        courseId,
        [],
        unitId,
        { responseVariation: promptExperimentVariationKey },
      );

      delete process.env.FEATURE_ENABLE_CHAT_V2_ENDPOINT;
    });

    it('triggers chat summary refresh for first message when upgradeable is true', async () => {
      const mockStateWithOneMessage = {
        learningAssistant: {
          messageList: [{ role: 'user', content: 'First message' }],
          conversationId: uuidv4(),
        },
      };
      const getStateWithMessage = jest.fn().mockReturnValue(mockStateWithOneMessage);

      // Test with V2 endpoint enabled
      process.env.FEATURE_ENABLE_CHAT_V2_ENDPOINT = 'true';
      const apiResponse = [{ role: 'assistant', content: 'Response' }];
      fetchChatResponse.mockResolvedValue(apiResponse);

      await getChatResponse(courseId, unitId, true)(dispatch, getStateWithMessage);

      expect(dispatch).toHaveBeenCalledWith(
        expect.any(Function), // getLearningAssistantChatSummary thunk
      );

      delete process.env.FEATURE_ENABLE_CHAT_V2_ENDPOINT;
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
          startDate: '2024-12-02T14:59:16.148236Z',
          expirationDate: '9999-12-16T14:59:16.148236Z',
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
          startDate: '2024-12-02T14:59:16.148236Z',
          expirationDate: '9999-12-16T14:59:16.148236Z',
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
