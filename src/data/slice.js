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
  auditTrial: {
    startDate: null,
    expirationDate: null,
  },
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
    setAuditTrial: (state, { payload }) => {
      state.auditTrial = payload;
      // state.auditTrial.startDate = payload.start_date;
      // state.auditTrial.expirationDate = payload.expiration_date;
    },
  },
});

export const {
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
} = learningAssistantSlice.actions;

export const {
  reducer,
} = learningAssistantSlice;
