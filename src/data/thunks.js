import fetchChatResponse from './api';
import {
  setCurrentMessage,
  setMessageList,
  setApiError,
  resetMessages,
} from './slice';

export function addChatMessage(role, content) {
  return (dispatch, getState) => {
    const { messageList } = getState().learningAssistant;
    const message = {
      role,
      content,
      timestamp: new Date(),
    };
    const updatedMessageList = [...messageList, message];
    dispatch(setMessageList({ messageList: updatedMessageList }));
  };
}

export function getChatResponse(courseId) {
  return async (dispatch, getState) => {
    const { messageList } = getState().learningAssistant;
    try {
      const message = await fetchChatResponse(courseId, messageList);
      addChatMessage(message.role, message.content);
    } catch (error) {
      dispatch(setApiError());
    }
  };
}

export function clearMessages() {
  return (dispatch) => {
    dispatch(resetMessages());
  };
}

export function updateCurrentMessage(content) {
  return (dispatch) => {
    dispatch(setCurrentMessage({ currentMessage: content }));
  };
}
