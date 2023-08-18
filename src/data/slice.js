/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export const learningAssistantSlice = createSlice({
  name: 'learning-assistant',
  initialState: {
    currentMessage: '',
    messageList: [],
    apiError: false,
    conversationId: uuidv4(),
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
  },
});

export const {
  setCurrentMessage,
  clearCurrentMessage,
  setMessageList,
  resetMessages,
  setApiError,
} = learningAssistantSlice.actions;

export const {
  reducer,
} = learningAssistantSlice;
