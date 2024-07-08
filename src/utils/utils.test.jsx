import React from 'react';
import PropTypes from 'prop-types';

import { render, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { reducer as learningAssistantReducer } from '../data/slice';

function renderWithProviders(
  ui,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({ reducer: { learningAssistant: learningAssistantReducer }, preloadedState }),
    ...renderOptions
  } = {},
) {
  const Wrapper = ({ children }) => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

const createRandomResponseForTesting = () => {
  const words = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipiscing',
    'elit,', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
    'et', 'dolore', 'magna', 'aliqua.', 'Ut', 'enim', 'ad', 'minim', 'veniam,',
    'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip',
    'ex', 'ea', 'commodo', 'consequat.', 'Duis', 'aute', 'irure', 'dolor', 'in',
    'reprehenderit', 'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu',
    'fugiat', 'nulla', 'pariatur.', 'Excepteur', 'sint', 'occaecat', 'cupidatat',
    'non', 'proident,', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit',
    'anim', 'id', 'est', 'laborum'];

  const message = [];
  let numWords = 15;

  while (--numWords) {
    message.push(words[Math.floor(Math.random() * words.length)]);
  }

  return { role: 'assistant', content: message.join(' ') };
};

// Helper, that is used to forcibly finalize all promises
// in thunk before running matcher against state.
const executeThunk = async (thunk, dispatch, getState) => {
  await thunk(dispatch, getState);
  await new Promise(setImmediate);
};

export {
  renderWithProviders as render, act, createRandomResponseForTesting, executeThunk,
};
