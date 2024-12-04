/* eslint-disable no-import-assign */
import * as auth from '@edx/frontend-platform/auth';

import { fetchLearningAssistantChatSummary } from './api';

jest.mock('@edx/frontend-platform/auth');

const CHAT_RESPONSE_URL = 'https://some.url/endpoint';
jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ CHAT_RESPONSE_URL }),
  CHAT_RESPONSE_URL,
}));

describe('API', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchLearningAssistantChatSummary()', () => {
    const courseId = 'course-v1:edx+test+23';
    const apiPayload = {
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

    const mockGet = jest.fn(async () => ({
      data: apiPayload,
      catch: () => { },
    }));

    beforeEach(() => {
      auth.getAuthenticatedHttpClient = jest.fn(() => ({
        get: mockGet,
      }));
    });

    it('should call the endpoint and process the results', async () => {
      const response = await fetchLearningAssistantChatSummary(courseId);

      expect(response).toEqual(apiPayload);
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(`${CHAT_RESPONSE_URL}/${courseId}/chat-summary`);
    });
  });
});
