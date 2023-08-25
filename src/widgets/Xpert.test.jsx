import React from 'react';

import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as api from '../data/api';
import Xpert from './Xpert';

import { render, createRandomResponseForTesting } from '../utils/utils.test';

jest.mock('@edx/frontend-platform/analytics');

const initialState = {
  learningAssistant: {
    currentMessage: '',
    messageList: [],
    apiIsLoading: false,
    apiError: false,
    // TEMPORARY: This is simply to ensure that the tests pass by hiding the disclosure.
    //            I will remove this and write tests in a future pull request.
    disclosureAcknowledged: true,
  },
};
const courseId = 'course-v1:edX+DemoX+Demo_Course';

const assertSidebarElementsNotInDOM = () => {
  expect(screen.queryByTestId('heading', { name: 'Hi, I\'m Xpert!' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
  expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
};

beforeEach(() => {
  const responseMessage = createRandomResponseForTesting();
  jest.spyOn(api, 'default').mockResolvedValue(responseMessage);
});

test('initial load displays correct elements', () => {
  render(<Xpert courseId={courseId} />, { preloadedState: initialState });

  // button to open chat should be in the DOM
  expect(screen.getByRole('button', { name: 'Have a question?' })).toBeVisible();

  // assert that UI elements in the sidebar are not in the DOM
  assertSidebarElementsNotInDOM();
});
test('clicking the toggle button opens the sidebar', async () => {
  const user = userEvent.setup();

  render(<Xpert courseId={courseId} />, { preloadedState: initialState });

  await user.click(screen.getByRole('button', { name: 'Have a question?' }));

  // assert that UI elements present in the sidebar are visible
  expect(screen.getByRole('heading', { name: 'Hi, I\'m Xpert!' })).toBeVisible();
  expect(screen.getByRole('textbox')).toBeVisible();
  expect(screen.getByTestId('submit-button')).toBeVisible();
  expect(screen.getByTestId('close-button')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Clear' })).toBeVisible();
});
test('submitted text appears as message in the sidebar', async () => {
  const user = userEvent.setup();
  const userMessage = 'Hello, Xpert!';

  render(<Xpert courseId={courseId} />, { preloadedState: initialState });

  await user.click(screen.getByRole('button', { name: 'Have a question?' }));

  // type the user message
  const input = screen.getByRole('textbox');
  await user.type(input, userMessage);

  // because we use a controlled input element, assert that user's message appears in the input element
  expect(input).toHaveValue(userMessage);

  await user.click(screen.getByTestId('submit-button'));

  // assert that UI elements in the sidebar are in the DOM
  expect(screen.getByText(userMessage)).toBeInTheDocument();

  // because we use a controlled input element, assert that the input element is cleared
  expect(input).toHaveValue('');
});
test('loading message appears in the sidebar while the response loads', async () => {
  const user = userEvent.setup();
  const userMessage = 'Hello, Xpert!';

  // re-mock the fetchChatResponse API function so that we can assert that the
  // responseMessage appears in the DOM
  const responseMessage = createRandomResponseForTesting();
  jest.spyOn(api, 'default').mockResolvedValue(responseMessage);

  render(<Xpert courseId={courseId} />, { preloadedState: initialState });

  await user.click(screen.getByRole('button', { name: 'Have a question?' }));

  // type the user message
  await user.type(screen.getByRole('textbox'), userMessage);

  // It's better practice to use the userEvent API, but I could not get this test to properly assert
  // that the "Xpert is thinking" loading text appears in the DOM. Something about using the userEvent
  // API skipped straight to rendering the response message.
  fireEvent.click(screen.getByTestId('submit-button'));

  await screen.findByText('Xpert is thinking');
  await screen.findByText(responseMessage.content);
});
test('response text appears as message in the sidebar', async () => {
  const user = userEvent.setup();
  const userMessage = 'Hello, Xpert!';

  // re-mock the fetchChatResponse API function so that we can assert that the
  // responseMessage appears in the DOM
  const responseMessage = createRandomResponseForTesting();
  jest.spyOn(api, 'default').mockResolvedValue(responseMessage);

  render(<Xpert courseId={courseId} />, { preloadedState: initialState });

  await user.click(screen.getByRole('button', { name: 'Have a question?' }));

  // type the user message
  const input = screen.getByRole('textbox');
  await user.type(input, userMessage);
  await user.click(screen.getByTestId('submit-button'));

  await screen.findByText(responseMessage.content);
  expect(screen.getByText(responseMessage.content)).toBeInTheDocument();
});
test('clicking the clear button clears messages in the sidebar', async () => {
  const user = userEvent.setup();
  const userMessage = 'Hello, Xpert!';

  // re-mock the fetchChatResponse API function so that we can assert that the
  // responseMessage appears in the DOM and then is successfully cleared
  const responseMessage = createRandomResponseForTesting();
  jest.spyOn(api, 'default').mockImplementation(() => responseMessage);

  render(<Xpert courseId={courseId} />, { preloadedState: initialState });

  await user.click(screen.getByRole('button', { name: 'Have a question?' }));

  // type the user message
  const input = screen.getByRole('textbox');
  await user.type(input, userMessage);
  await user.click(screen.getByTestId('submit-button'));

  await screen.findByText(responseMessage.content);

  await user.click(screen.getByRole('button', { name: 'Clear' }));

  expect(screen.queryByText(userMessage)).not.toBeInTheDocument();
  expect(screen.queryByText(responseMessage.content)).not.toBeInTheDocument();
});
test('clicking the close button closes the sidebar', async () => {
  const user = userEvent.setup();
  render(<Xpert courseId={courseId} />, { preloadedState: initialState });

  await user.click(screen.getByRole('button', { name: 'Have a question?' }));
  await user.click(screen.getByTestId('close-button'));

  // assert that UI elements in the sidebar are not in the DOM
  assertSidebarElementsNotInDOM();
});
test('clicking the toggle button closes the sidebar', async () => {
  const user = userEvent.setup();
  render(<Xpert courseId={courseId} />, { preloadedState: initialState });

  await user.click(screen.getByRole('button', { name: 'Have a question?' }));
  await user.click(screen.getByTestId('toggle-button'));

  // assert that UI elements in the sidebar are not in the DOM
  assertSidebarElementsNotInDOM();
});
test('error message should disappear upon succesful api call', async () => {
  const user = userEvent.setup();
  const userMessage = 'Hello, Xpert!';

  const errorState = {
    learningAssistant: {
      currentMessage: '',
      messageList: [],
      apiIsLoading: false,
      apiError: true,
      // TEMPORARY: This is simply to ensure that the tests pass by hiding the disclosure.
      //            I will remove this and write tests in a future pull request.
      disclosureAcknowledged: true,
    },
  };
  render(<Xpert courseId={courseId} />, { preloadedState: errorState });

  await user.click(screen.getByRole('button', { name: 'Have a question?' }));

  // assert that error message exists
  expect(screen.queryByText('Please try again by sending another question.')).toBeInTheDocument();

  // submit text, assert that error message disappears
  const input = screen.getByRole('textbox');
  await user.type(input, userMessage);
  await user.click(screen.getByTestId('submit-button'));
  expect(screen.queryByText('Please try again by sending another question.')).not.toBeInTheDocument();
});
test('error message should disappear when dismissed', async () => {
  const user = userEvent.setup();

  const errorState = {
    learningAssistant: {
      currentMessage: '',
      messageList: [],
      apiIsLoading: false,
      apiError: true,
      // TEMPORARY: This is simply to ensure that the tests pass by hiding the disclosure.
      //            I will remove this and write tests in a future pull request.
      disclosureAcknowledged: true,
    },
  };
  render(<Xpert courseId={courseId} />, { preloadedState: errorState });

  await user.click(screen.getByRole('button', { name: 'Have a question?' }));

  // assert that error message exists
  expect(screen.queryByText('Please try again by sending another question.')).toBeInTheDocument();

  // dismiss alert, assert that error message disappears
  await user.click(screen.getByText('Dismiss'));
  expect(screen.queryByText('Please try again by sending another question.')).not.toBeInTheDocument();
});
test('error message should disappear when messages cleared', async () => {
  const user = userEvent.setup();

  const errorState = {
    learningAssistant: {
      currentMessage: '',
      messageList: [],
      apiIsLoading: false,
      apiError: true,
      // TEMPORARY: This is simply to ensure that the tests pass by hiding the disclosure.
      //            I will remove this and write tests in a future pull request.
      disclosureAcknowledged: true,
    },
  };
  render(<Xpert courseId={courseId} />, { preloadedState: errorState });

  await user.click(screen.getByRole('button', { name: 'Have a question?' }));

  // assert that error message exists
  expect(screen.queryByText('Please try again by sending another question.')).toBeInTheDocument();

  // clear messages, assert that error message disappears
  await user.click(screen.getByText('Clear'));
  expect(screen.queryByText('Please try again by sending another question.')).not.toBeInTheDocument();
});
