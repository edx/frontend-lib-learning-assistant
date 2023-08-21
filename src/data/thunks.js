import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import fetchChatResponse from './api';
import {
  setCurrentMessage,
  clearCurrentMessage,
  resetMessages,
  setMessageList,
  setApiError,
  setApiIsLoading,
} from './slice';

export function addChatMessage(role, content) {
  return (dispatch, getState) => {
    const { messageList, conversationId } = getState().learningAssistant;

    // Redux recommends only serializable values in the store, so we'll stringify the timestap to store in Redux.
    // When we need to operate on the Date object, we'll deserialize the string.
    const timestamp = new Date();

    const message = {
      role,
      content,
      timestamp: timestamp.toString(),
    };
    const updatedMessageList = [...messageList, message];
    dispatch(setMessageList({ messageList: updatedMessageList }));
    dispatch(clearCurrentMessage());
    sendTrackEvent('edx.ui.lms.learning_assistant.message', {
      id: conversationId,
      timestamp: message.timestamp,
      role: message.role,
      content: message.content,
    });
  };
}

export function getChatResponse(courseId) {
  return async (dispatch, getState) => {
    const { messageList } = getState().learningAssistant;

    dispatch(setApiIsLoading(true));
    try {
      const message = await fetchChatResponse(courseId, messageList);
      dispatch(setApiIsLoading(false));
      dispatch(addChatMessage(message.role, message.content));
    } catch (error) {
      dispatch(setApiError());
      dispatch(setApiIsLoading(false));
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
