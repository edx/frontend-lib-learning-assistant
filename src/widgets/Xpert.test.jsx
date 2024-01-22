import React from 'react';

import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as api from '../data/api';
import Xpert from './Xpert';

import { render, createRandomResponseForTesting } from '../utils/utils.test';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(() => ({ userId: 1 })),
}));

const initialState = {
  learningAssistant: {
    currentMessage: '',
    messageList: [],
    apiIsLoading: false,
    apiError: false,
    // TEMPORARY: This is simply to ensure that the tests pass by hiding the disclosure.
    //            I will remove this and write tests in a future pull request.
    disclosureAcknowledged: true,
    sidebarIsOpen: false,
  },
};
const courseId = 'course-v1:edX+DemoX+Demo_Course';

const assertSidebarElementsNotInDOM = () => {
  expect(screen.queryByTestId('heading', { name: 'Hi, I\'m Xpert!' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

  expect(screen.queryByRole('button', { name: 'submit' })).not.toBeInTheDocument();
  expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'clear' })).not.toBeInTheDocument();
};

beforeEach(() => {
  const responseMessage = createRandomResponseForTesting();
  jest.spyOn(api, 'default').mockResolvedValue(responseMessage);
  window.localStorage.clear();
  // Popup modal should be ignored for all tests unless explicitly enabled. This is because
  // it makes all other elements non-clickable, so it is easier to test most test cases without the popup.
  window.localStorage.setItem('completedLearningAssistantTour', 'true');
});

test('initial load displays correct elements', () => {
  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  // button to open chat should be in the DOM
  expect(screen.queryByTestId('toggle-button')).toBeVisible();
  expect(screen.queryByTestId('action-message')).toBeVisible();

  // assert that UI elements in the sidebar are not in the DOM
  assertSidebarElementsNotInDOM();
});
test('clicking the call to action dismiss button removes the message', async () => {
  const user = userEvent.setup();
  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  // button to open chat should be in the DOM
  expect(screen.queryByTestId('toggle-button')).toBeVisible();
  expect(screen.queryByTestId('action-message')).toBeVisible();

  await user.click(screen.getByRole('button', { name: 'dismiss' }));
  expect(screen.queryByTestId('toggle-button')).toBeVisible();
  expect(screen.queryByTestId('action-message')).not.toBeInTheDocument();

  // re-render exam, button to dismiss cta should not be there
  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });
  expect(screen.queryByRole('button', { name: 'dismiss' })).not.toBeInTheDocument();
});
test('clicking the call to action opens the sidebar', async () => {
  const user = userEvent.setup();

  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  await user.click(screen.queryByTestId('message-button'));

  // assert that UI elements present in the sidebar are visible
  expect(screen.getByRole('heading', { name: 'Hi, I\'m Xpert!' })).toBeVisible();
  expect(screen.getByRole('textbox')).toBeVisible();
  expect(screen.getByRole('button', { name: 'submit' })).toBeVisible();
  expect(screen.getByTestId('close-button')).toBeVisible();
  expect(screen.getByRole('button', { name: 'clear' })).toBeVisible();

  // assert that text input has focus
  expect(screen.getByRole('textbox')).toHaveFocus();
});
test('clicking the toggle button opens the sidebar', async () => {
  const user = userEvent.setup();

  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  await user.click(screen.queryByTestId('toggle-button'));

  // assert that UI elements present in the sidebar are visible
  expect(screen.getByRole('heading', { name: 'Hi, I\'m Xpert!' })).toBeVisible();
  expect(screen.getByRole('textbox')).toBeVisible();
  expect(screen.getByRole('button', { name: 'submit' })).toBeVisible();
  expect(screen.getByTestId('close-button')).toBeVisible();
  expect(screen.getByRole('button', { name: 'clear' })).toBeVisible();

  // assert that text input has focus
  expect(screen.getByRole('textbox')).toHaveFocus();
});
test('submitted text appears as message in the sidebar', async () => {
  const user = userEvent.setup();
  const userMessage = 'Hello, Xpert!';

  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  await user.click(screen.queryByTestId('toggle-button'));

  // type the user message
  const input = screen.getByRole('textbox');
  await user.type(input, userMessage);

  // because we use a controlled input element, assert that user's message appears in the input element
  expect(input).toHaveValue(userMessage);

  await user.click(screen.getByRole('button', { name: 'submit' }));

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

  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  await user.click(screen.queryByTestId('toggle-button'));

  // type the user message
  await user.type(screen.getByRole('textbox'), userMessage);

  // It's better practice to use the userEvent API, but I could not get this test to properly assert
  // that the "Xpert is thinking" loading text appears in the DOM. Something about using the userEvent
  // API skipped straight to rendering the response message.
  await fireEvent.click(screen.getByRole('button', { name: 'submit' }));

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

  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  await user.click(screen.queryByTestId('toggle-button'));

  // type the user message
  const input = screen.getByRole('textbox');
  await user.type(input, userMessage);
  await user.click(screen.getByRole('button', { name: 'submit' }));

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

  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  await user.click(screen.queryByTestId('toggle-button'));

  // type the user message
  const input = screen.getByRole('textbox');
  await user.type(input, userMessage);
  await user.click(screen.getByRole('button', { name: 'submit' }));

  await screen.findByText(responseMessage.content);

  await user.click(screen.getByRole('button', { name: 'clear' }));

  expect(screen.queryByText(userMessage)).not.toBeInTheDocument();
  expect(screen.queryByText(responseMessage.content)).not.toBeInTheDocument();
});
test('clicking the close button closes the sidebar', async () => {
  const user = userEvent.setup();
  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  await user.click(screen.queryByTestId('toggle-button'));
  await user.click(screen.getByTestId('close-button'));

  // assert that UI elements in the sidebar are not in the DOM
  assertSidebarElementsNotInDOM();
});
test('toggle elements do not appear when sidebar is open', async () => {
  const user = userEvent.setup();
  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  await user.click(screen.queryByTestId('toggle-button'));

  expect(screen.queryByTestId('toggle-button')).not.toBeInTheDocument();
  expect(screen.queryByTestId('action-message')).not.toBeInTheDocument();
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
      sidebarIsOpen: false,
    },
  };
  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: errorState });

  await user.click(screen.queryByTestId('toggle-button'));

  // assert that error has focus
  expect(screen.queryByTestId('alert-heading')).toHaveFocus();

  // assert that error message exists
  expect(screen.queryByText('Please try again by sending another question.')).toBeInTheDocument();

  // submit text, assert that error message disappears
  const input = screen.getByRole('textbox');
  await user.type(input, userMessage);
  await user.click(screen.getByRole('button', { name: 'submit' }));
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
      sidebarIsOpen: false,
    },
  };
  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: errorState });

  await user.click(screen.queryByTestId('toggle-button'));

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
      sidebarIsOpen: false,
    },
  };
  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: errorState });

  await user.click(screen.queryByTestId('toggle-button'));

  // assert that error message exists
  expect(screen.queryByText('Please try again by sending another question.')).toBeInTheDocument();

  // clear messages, assert that error message disappears
  await user.click(screen.getByText('Clear'));
  expect(screen.queryByText('Please try again by sending another question.')).not.toBeInTheDocument();
});
test('popup modal should open chat', async () => {
  const user = userEvent.setup();
  window.localStorage.clear();

  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  // button to open chat should be in the DOM
  expect(screen.queryByTestId('toggle-button')).toBeVisible();
  expect(screen.queryByTestId('modal-message')).toBeVisible();

  // click check it out
  await user.click(screen.queryByTestId('check-button'));

  // assert that UI elements present in the sidebar are visible
  expect(screen.getByRole('heading', { name: 'Hi, I\'m Xpert!' })).toBeVisible();
  expect(screen.getByRole('textbox')).toBeVisible();
  expect(screen.getByRole('button', { name: 'submit' })).toBeVisible();
  expect(screen.getByTestId('close-button')).toBeVisible();
  expect(screen.getByRole('button', { name: 'clear' })).toBeVisible();
});
test('popup modal should close and display CTA', async () => {
  const user = userEvent.setup();
  window.localStorage.clear();

  render(<Xpert courseId={courseId} contentToolsEnabled={false} />, { preloadedState: initialState });

  // button to open chat should be in the DOM
  expect(screen.queryByTestId('toggle-button')).toBeVisible();
  expect(screen.queryByTestId('modal-message')).toBeVisible();

  // click close
  await user.click(screen.queryByTestId('close-button'));

  assertSidebarElementsNotInDOM();
  expect(screen.queryByTestId('action-message')).toBeVisible();
});
