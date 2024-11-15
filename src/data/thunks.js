import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import trackChatBotMessageOptimizely from '../utils/optimizelyExperiment';
import { fetchChatResponse, fetchLearningAssistantMessageHistory, fetchLearningAssistantEnabled } from './api';
import {
  setCurrentMessage,
  clearCurrentMessage,
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

export function getLearningAssistantMessageHistory(courseId) {
  return async (dispatch) => {
    dispatch(setApiIsLoading(true));

    try {
      const rawMessageList = await fetchLearningAssistantMessageHistory(courseId);

      if (rawMessageList.length) {
        const messageList = rawMessageList
          .map(({ timestamp, ...msg }) => ({
            ...msg,
            timestamp: new Date(timestamp), // Parse ISO time to Date()
          }));

        dispatch(setMessageList({ messageList }));

        // If it has chat history, then we assume the user already aknowledged.
        dispatch(setDisclosureAcknowledged(true));
      }
    } catch (e) {
      // If fetching the messages fail, we just won't show it.
    }

    dispatch(setApiIsLoading(false));
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
