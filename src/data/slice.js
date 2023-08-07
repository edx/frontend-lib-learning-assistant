/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const learningAssistantSlice = createSlice({
  name: 'learning-assistant',
  initialState: {
    currentMessage: '',
    messageList: [],
    apiError: false,
  },
  reducers: {
    setCurrentMessage: (state, { payload }) => {
      state.currentMessage = payload.currentMessage;
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
  setMessageList,
  resetMessages,
  setApiError,
} = learningAssistantSlice.actions;

export const {
  reducer,
} = learningAssistantSlice.reducer;
