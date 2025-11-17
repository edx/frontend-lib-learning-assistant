import { v4 as uuidv4 } from 'uuid';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

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
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
  ensureConfig: jest.fn(),
  camelCaseObject: (obj) => obj,
}));

const mockState = {
  learningAssistant: { messageList: [], conversationId: uuidv4() },
};

describe('Thunks unit tests', () => {
  const dispatch = jest.fn();
  const getState = jest.fn().mockReturnValue(mockState);

  beforeEach(() => {
    getAuthenticatedUser.mockReturnValue({ userId });
    getState.mockReturnValue(mockState);
    getConfig.mockReturnValue({ FEATURE_ENABLE_CHAT_V2_ENDPOINT: undefined });
  });

  afterEach(() => {
    dispatch.mockClear();
    getState.mockClear();
    getAuthenticatedUser.mockClear();
    fetchLearningAssistantChatSummary.mockClear();
    fetchChatResponse.mockClear();
    sendTrackEvent.mockClear();
    getConfig.mockClear();
  });

  describe('addChatMessage()', () => {
    const mockDate = new Date(2024, 1, 1);

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterEach(() => {
      jest.useRealTimers();
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
      expect(sendTrackEvent).toHaveBeenCalledWith(eventName, properties);
    });
  });

  describe('getChatResponse()', () => {
    const courseId = 'course-v1:edx+test+23';
    const unitId = 'unit123';
    const upgradeable = false;

    describe('when chat V2 flag enabled via getConfig', () => {
      beforeEach(() => {
        getConfig.mockReturnValue({ FEATURE_ENABLE_CHAT_V2_ENDPOINT: 'true' });
      });

      it('handles API response as array and dispatches addChatMessage for each message', async () => {
        const apiResponse = [
          { role: 'assistant', content: 'Hello!' },
          { role: 'assistant', content: 'How can I help?' },
        ];
        fetchChatResponse.mockResolvedValue(apiResponse);
        await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);
        expect(fetchChatResponse).toHaveBeenCalledWith(courseId, [], unitId, {});
        // Expect two addChatMessage thunks dispatched plus loading toggles
        const addChatCalls = dispatch.mock.calls.filter(([arg]) => typeof arg === 'function');
        expect(addChatCalls.length).toBe(2);
      });

      it('passes promptExperimentVariationKey to query params', async () => {
        const variation = 'variation_a';
        fetchChatResponse.mockResolvedValue([{ role: 'assistant', content: 'Test response' }]);
        await getChatResponse(courseId, unitId, upgradeable, variation)(dispatch, getState);
        expect(fetchChatResponse).toHaveBeenCalledWith(courseId, [], unitId, { responseVariation: variation });
      });
    });

    describe('when chat V2 flag disabled via getConfig', () => {
      beforeEach(() => {
        getConfig.mockReturnValue({ FEATURE_ENABLE_CHAT_V2_ENDPOINT: 'false' });
      });

      it('handles API response as single object', async () => {
        const apiResponse = { role: 'assistant', content: 'Single response' };
        fetchChatResponse.mockResolvedValue(apiResponse);
        await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);
        const addChatCalls = dispatch.mock.calls.filter(([arg]) => typeof arg === 'function');
        expect(addChatCalls.length).toBe(1);
      });

      it('still processes array shape ignoring flag (shape detection precedence)', async () => {
        const apiResponse = [
          { role: 'assistant', content: 'Msg 1' },
          { role: 'assistant', content: 'Msg 2' },
        ];
        fetchChatResponse.mockResolvedValue(apiResponse);
        await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);
        const addChatCalls = dispatch.mock.calls.filter(([arg]) => typeof arg === 'function');
        expect(addChatCalls.length).toBe(2);
      });
    });

    describe('when chat flag not set', () => {
      beforeEach(() => {
        getConfig.mockReturnValue({});
      });

      it('defaults to object handling', async () => {
        const apiResponse = { role: 'assistant', content: 'Default response' };
        fetchChatResponse.mockResolvedValue(apiResponse);
        await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);
        const addChatCalls = dispatch.mock.calls.filter(([arg]) => typeof arg === 'function');
        expect(addChatCalls.length).toBe(1);
      });
    });

    it('filters invalid items in array', async () => {
      getConfig.mockReturnValue({ FEATURE_ENABLE_CHAT_V2_ENDPOINT: 'true' });
      const apiResponse = [
        { role: 'assistant', content: 'Valid 1' },
        { role: 'assistant' }, // missing content
        { content: 'No role' }, // missing role
        null, // invalid
        { role: 'assistant', content: 'Valid 2' },
      ];
      fetchChatResponse.mockResolvedValue(apiResponse);
      await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);
      const addChatCalls = dispatch.mock.calls.filter(([arg]) => typeof arg === 'function');
      expect(addChatCalls.length).toBe(2);
    });

    it('ignores object missing role/content', async () => {
      getConfig.mockReturnValue({ FEATURE_ENABLE_CHAT_V2_ENDPOINT: 'false' });
      const apiResponse = { role: 'assistant' }; // missing content
      fetchChatResponse.mockResolvedValue(apiResponse);
      await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);
      const addChatCalls = dispatch.mock.calls.filter(([arg]) => typeof arg === 'function');
      expect(addChatCalls.length).toBe(0);
    });

    it('handles API errors and dispatches setApiError', async () => {
      fetchChatResponse.mockRejectedValue(new Error('API Error'));
      await getChatResponse(courseId, unitId, upgradeable)(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'learning-assistant/setApiError' }));
    });

    it('triggers chat summary refresh for first message when upgradeable is true', async () => {
      getConfig.mockReturnValue({ FEATURE_ENABLE_CHAT_V2_ENDPOINT: 'true' });
      const mockStateWithOneMessage = {
        learningAssistant: {
          messageList: [{ role: 'user', content: 'First message' }],
          conversationId: uuidv4(),
        },
      };
      const getStateWithMessage = jest.fn().mockReturnValue(mockStateWithOneMessage);
      fetchChatResponse.mockResolvedValue([{ role: 'assistant', content: 'Response' }]);
      await getChatResponse(courseId, unitId, true)(dispatch, getStateWithMessage);
      // At least one thunk dispatch for summary
      expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
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
