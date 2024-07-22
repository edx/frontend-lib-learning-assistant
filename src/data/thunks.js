import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import trackChatBotMessageOptimizely from '../utils/optimizelyExperiment';
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
import { OPTIMIZELY_PROMPT_EXPERIMENT_KEY } from './optimizely';

export function addChatMessage(role, content, courseId, promptExperimentVariationKey = undefined) {
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
    dispatch(resetApiError());

    const { userId } = getAuthenticatedUser();

    sendTrackEvent('edx.ui.lms.learning_assistant.message', {
      id: conversationId,
      course_id: courseId,
      user_id: userId,
      timestamp: message.timestamp,
      role: message.role,
      content: message.content,
      ...(promptExperimentVariationKey ? {
        experiment_name: OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
        variation_key: promptExperimentVariationKey,
      } : {}),
    });
  };
}

export function getChatResponse(courseId, unitId, promptExperimentVariationKey = undefined) {
  return async (dispatch, getState) => {
    const { userId } = getAuthenticatedUser();
    const { messageList } = getState().learningAssistant;

    dispatch(setApiIsLoading(true));
    try {
      if (promptExperimentVariationKey) {
        trackChatBotMessageOptimizely(userId.toString());
      }
      const customQueryParams = promptExperimentVariationKey ? { responseVariation: promptExperimentVariationKey } : {};
      const message = await fetchChatResponse(courseId, messageList, unitId, customQueryParams);

      dispatch(setApiIsLoading(false));
      dispatch(addChatMessage(message.role, message.content, courseId, promptExperimentVariationKey));
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
