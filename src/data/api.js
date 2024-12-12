import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

async function fetchChatResponse(courseId, messageList, unitId, customQueryParams = {}) {
  const payload = messageList.map((message) => ({
    role: message?.role,
    content: message?.content,
  }));

  let queryParams = {
    unitId,
    ...customQueryParams,
  };

  queryParams = snakeCaseObject(queryParams);

  let queryString = new URLSearchParams(queryParams);
  queryString = queryString.toString();

  const url = new URL(`${getConfig().CHAT_RESPONSE_URL}/${courseId}?${queryString}`);
  const { data } = await getAuthenticatedHttpClient().post(url.href, payload);

  return data;
}

async function fetchLearningAssistantChatSummary(courseId) {
  const url = new URL(`${getConfig().CHAT_RESPONSE_URL}/${courseId}/chat-summary`);

  const { data } = await getAuthenticatedHttpClient().get(url.href);
  return data;
}

export {
  fetchChatResponse,
  fetchLearningAssistantChatSummary,
};
