/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export const initialState = {
  currentMessage: '',
  messageList: [],
  apiError: false,
  apiIsLoading: false,
  conversationId: uuidv4(),
  disclosureAcknowledged: false,
  sidebarIsOpen: false,
  isEnabled: false,
  experiments: {},
};

export const learningAssistantSlice = createSlice({
  name: 'learning-assistant',
  initialState,
  reducers: {
    setCurrentMessage: (state, { payload }) => {
      state.currentMessage = payload.currentMessage;
    },
    clearCurrentMessage: (state) => {
      state.currentMessage = '';
    },
    setMessageList: (state, { payload }) => {
      state.messageList = payload.messageList;
    },
    resetMessages: (state) => {
      state.currentMessage = '';
      state.messageList = [];
      state.apiError = false;
    },
    setApiError: (state) => {
      state.apiError = true;
    },
    resetApiError: (state) => {
      state.apiError = false;
    },
    setApiIsLoading: (state, { payload }) => {
      state.apiIsLoading = payload;
    },
    setDisclosureAcknowledged: (state, { payload }) => {
      state.disclosureAcknowledged = payload;
    },
    setSidebarIsOpen: (state, { payload }) => {
      state.sidebarIsOpen = payload;
    },
    setIsEnabled: (state, { payload }) => {
      state.isEnabled = payload;
    },
    setExperiment: (state, { payload }) => {
      const { flag, active, variationKey } = payload;
      state.experiments[flag] = { active, variationKey };
    },
    clearExperiment: (state, { payload: flag }) => {
      delete state.experiments[flag];
    },
  },
});

export const {
  setCurrentMessage,
  clearCurrentMessage,
  setMessageList,
  resetMessages,
  setApiError,
  setApiIsLoading,
  resetApiError,
  setDisclosureAcknowledged,
  setSidebarIsOpen,
  setIsEnabled,
  setExperiment,
  clearExperiment,
} = learningAssistantSlice.actions;

export const {
  reducer,
} = learningAssistantSlice;
