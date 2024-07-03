import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { trackChatBotMessageOptimizely } from '../utils/optimizelyExperiment';
import fetchChatResponse, { fetchLearningAssistantEnabled } from './api';
import {
  setCurrentMessage,
  clearCurrentMessage,
  resetMessages,
  setMessageList,
  setApiError,
  setApiIsLoading,
  resetApiError,
  setDisclosureAcknowledged,
  setSidebarIsOpen,
  setIsEnabled,
} from './slice';
import { PROMPT_EXPERIMENT_FLAG } from '../constants/experiments';

export function addChatMessage(role, content, courseId) {
  return (dispatch, getState) => {
    const { messageList, conversationId, experiments } = getState().learningAssistant;
    const { variationKey } = experiments ? experiments[PROMPT_EXPERIMENT_FLAG] : {};

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
    dispatch(resetApiError());

    const { userId } = getAuthenticatedUser();

    sendTrackEvent('edx.ui.lms.learning_assistant.message', {
      id: conversationId,
      course_id: courseId,
      user_id: userId,
      timestamp: message.timestamp,
      role: message.role,
      content: message.content,
      ...(variationKey ? { experiment_name: PROMPT_EXPERIMENT_FLAG, variation_key: variationKey } : {}),
    });
  };
}

export function getChatResponse(courseId, unitId) {
  return async (dispatch, getState) => {
    const { userId } = getAuthenticatedUser();
    const { messageList } = getState().learningAssistant;

    const { enabled, variationKey } = getState().experiments?.[PROMPT_EXPERIMENT_FLAG] || {};

    dispatch(setApiIsLoading(true));
    try {
      if (enabled) {
        trackChatBotMessageOptimizely(userId);
      }
      const customQueryParams = variationKey ? { responseVariation: variationKey } : {};
      const message = await fetchChatResponse(courseId, messageList, unitId, customQueryParams);

      dispatch(setApiIsLoading(false));
      dispatch(addChatMessage(message.role, message.content, courseId));
    } catch (error) {
      dispatch(setApiError());
      dispatch(setApiIsLoading(false));
    }
  };
}

export function clearMessages() {
  return (dispatch) => {
    dispatch(resetMessages());
    dispatch(resetApiError());
  };
}

export function updateCurrentMessage(content) {
  return (dispatch) => {
    dispatch(setCurrentMessage({ currentMessage: content }));
  };
}

export function clearApiError() {
  return (dispatch) => {
    dispatch(resetApiError());
  };
}

export function acknowledgeDisclosure(isDisclosureAcknowledged) {
  return (dispatch) => {
    dispatch(setDisclosureAcknowledged(isDisclosureAcknowledged));
  };
}

export function updateSidebarIsOpen(isOpen) {
  return (dispatch) => {
    dispatch(setSidebarIsOpen(isOpen));
  };
}

export function getIsEnabled(courseId) {
  return async (dispatch) => {
    try {
      const data = await fetchLearningAssistantEnabled(courseId);
      dispatch(setIsEnabled(data.enabled));
    } catch (error) {
      dispatch(setApiError());
    }
  };
}
