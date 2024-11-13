/* eslint-disable no-import-assign */
import * as auth from '@edx/frontend-platform/auth';

import { fetchLearningAssistantMessageHistory } from './api';

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

  describe('fetchLearningAssistantMessageHistory()', () => {
    const fakeCourseId = 'course-v1:edx+test+23';
    const apiPayload = [
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

    const fakeGet = jest.fn(async () => ({
      data: apiPayload,
      catch: () => {},
    }));

    beforeEach(() => {
      auth.getAuthenticatedHttpClient = jest.fn(() => ({
        get: fakeGet,
      }));
    });

    it('should call the endpoint and process the results', async () => {
      const response = await fetchLearningAssistantMessageHistory(fakeCourseId);

      expect(response).toEqual(apiPayload);
      expect(fakeGet).toHaveBeenCalledTimes(1);
      expect(fakeGet).toHaveBeenCalledWith(`${CHAT_RESPONSE_URL}/${fakeCourseId}/history`);
    });
  });
});
