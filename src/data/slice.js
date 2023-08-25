/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export const learningAssistantSlice = createSlice({
  name: 'learning-assistant',
  initialState: {
    currentMessage: '',
    messageList: [],
    apiError: false,
    apiIsLoading: false,
    conversationId: uuidv4(),
    disclosureAcknowledged: false,
  },
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
} = learningAssistantSlice.actions;

export const {
  reducer,
} = learningAssistantSlice;
