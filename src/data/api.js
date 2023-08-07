import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

async function fetchChatResponse(courseId, messageList) {
  const payload = messageList.map((message) => ({
    role: message?.role,
    content: message?.content,
  }));

  const url = new URL(
    `${getConfig().CHAT_RESPONSE_URL}/${courseId}`,
  );

  const { data } = await getAuthenticatedHttpClient().post(url.href, payload);
  return data;
}

export default fetchChatResponse;
