import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { camelCaseObject } from '@edx/frontend-platform';
import { trackChatBotMessageOptimizely } from '../utils/optimizelyExperiment';
import {
  fetchChatResponse,
  fetchLearningAssistantChatSummary,
} from './api';
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
  setAuditTrial,
  setAuditTrialLengthDays,
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
      ...(promptExperimentVariationKey ? {
        experiment_name: OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
        variation_key: promptExperimentVariationKey,
      } : {}),
    });
  };
}

export function getChatResponse(courseId, unitId, upgradeable, promptExperimentVariationKey = undefined) {
  return async (dispatch, getState) => {
    const { userId } = getAuthenticatedUser();
    const { messageList } = getState().learningAssistant;

    dispatch(setApiIsLoading(true));
    try {
      if (promptExperimentVariationKey) {
        trackChatBotMessageOptimizely(userId.toString());
      }
      const customQueryParams = promptExperimentVariationKey ? { responseVariation: promptExperimentVariationKey } : {};
      const messages = await fetchChatResponse(courseId, messageList, unitId, customQueryParams);

      // Refresh chat summary only on the first message for an upgrade eligible user
      // so we can tell if the user has just initiated an audit trial
      if (messageList.length === 1 && upgradeable) {
        // eslint-disable-next-line no-use-before-define
        dispatch(getLearningAssistantChatSummary(courseId));
      }
      messages.forEach(msg => {
        dispatch(addChatMessage(msg.role, msg.content, courseId, promptExperimentVariationKey));
      });
    } catch (error) {
      dispatch(setApiError());
    } finally {
      dispatch(setApiIsLoading(false));
    }
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

export function getLearningAssistantChatSummary(courseId) {
  return async (dispatch) => {
    dispatch(setApiIsLoading(true));

    try {
      const data = await fetchLearningAssistantChatSummary(courseId);

      // Enabled
      dispatch(setIsEnabled(data.enabled));

      // Message History
      const rawMessageList = data.message_history;

      // If returned message history data is not empty
      if (rawMessageList.length) {
        const messageList = rawMessageList
          .map(({ timestamp, ...msg }) => ({
            ...msg,
            timestamp: new Date(timestamp).toString(), // Parse ISO time to Date()
          }));

        dispatch(setMessageList({ messageList }));

        // If it has chat history, then we assume the user already aknowledged.
        dispatch(setDisclosureAcknowledged(true));
      }

      // Audit Trial
      const auditTrial = {
        startDate: data.audit_trial.start_date,
        expirationDate: data.audit_trial.expiration_date,
      };

      // Validate audit trial data & dates
      const auditTrialDatesValid = !(
        Number.isNaN(Date.parse(auditTrial.startDate))
        || Number.isNaN(Date.parse(auditTrial.expirationDate))
      );

      if (Object.keys(auditTrial).length !== 0 && auditTrialDatesValid) {
        dispatch(setAuditTrial(camelCaseObject(auditTrial)));
      }

      if (data.audit_trial_length_days) { dispatch(setAuditTrialLengthDays(data.audit_trial_length_days)); }
    } catch (error) {
      dispatch(setApiError());
    }
    dispatch(setApiIsLoading(false));
  };
}
