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
    disclosureAcknowledged: false,
  },
};
const courseId = 'course-v1:edX+DemoX+Demo_Course';

const assertSidebarContainerElements = (inDOM) => {
  if (inDOM) {
    expect(screen.queryByTestId('close-button')).toBeInTheDocument();
  } else {
    expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();
  }
};

const assertSidebarElements = (inDOM) => {
  if (inDOM) {
    expect(screen.queryByRole('heading', { name: 'Hi, I\'m Xpert!' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByTestId('submit-button')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeInTheDocument();
  } else {
    expect(screen.queryByRole('heading', { name: 'Hi, I\'m Xpert!' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  }
};

const assertDisclosureElements = (inDOM) => {
  if (inDOM) {
    expect(screen.getByText('This chat is AI generated (powered by ChatGPT).', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('privacy policy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Let\'s get started.' })).toBeInTheDocument();
  } else {
    expect(screen.queryByText('This chat is AI generated (powered by ChatGPT', { exact: false })).not.toBeInTheDocument();
    expect(screen.queryByText('privacy policy')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Let\'s get started.' })).not.toBeInTheDocument();
  }
};

describe('Toggle', () => {
  beforeEach(async () => {
    const responseMessage = createRandomResponseForTesting();
    jest.spyOn(api, 'default').mockResolvedValue(responseMessage);

    render(<Xpert courseId={courseId} />, { preloadedState: initialState });
  });

  it('initial load displays correct toggle elements', () => {
    // button to open chat should be in the DOM
    expect(screen.getByRole('button', { name: 'Have a question?' })).toBeVisible();

    // assert that UI elements in the sidebar are not in the DOM
    assertDisclosureElements(false);
    assertSidebarContainerElements(false);
    assertSidebarElements(false);
  });
  it('clicking the toggle button opens the sidebar', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Have a question?' }));

    // assert that UI elements present in the sidebar are visible
    assertDisclosureElements(true);
    assertSidebarContainerElements(true);
    assertSidebarElements(false);
  });
  test('clicking the toggle button closes the sidebar', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Have a question?' }));
    await user.click(screen.getByTestId('toggle-button'));

    // assert that UI elements in the sidebar are not in the DOM
    assertDisclosureElements(false);
    assertSidebarContainerElements(false);
    assertSidebarElements(false);
  });
});

describe('Sidebar', () => {
  beforeEach(async () => {
    const responseMessage = createRandomResponseForTesting();
    jest.spyOn(api, 'default').mockResolvedValue(responseMessage);

    render(<Xpert courseId={courseId} />, { preloadedState: initialState });

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Have a question?' }));
    await user.click(screen.getByRole('button', { name: 'Let\'s get started.' }));
  });
  it('submitted text appears as message in the sidebar', async () => {
    const user = userEvent.setup();
    const userMessage = 'Hello, Xpert!';

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

    await user.click(screen.getByTestId('close-button'));

    // assert that UI elements in the sidebar are not in the DOM
    assertDisclosureElements(false);
    assertSidebarContainerElements(false);
    assertSidebarElements(false);
  });
});

describe('Error', () => {
  const userMessage = 'Hello, Xpert';

  beforeEach(async () => {
    jest.spyOn(api, 'default').mockRejectedValue(new Error('sample API error'));

    const user = userEvent.setup();

    render(<Xpert courseId={courseId} />, { preloadedState: initialState });

    await user.click(screen.getByRole('button', { name: 'Have a question?' }));
    await user.click(screen.getByRole('button', { name: 'Let\'s get started.' }));

    // type the user message
    const input = screen.getByRole('textbox');
    await user.type(input, userMessage);
    await user.click(screen.getByTestId('submit-button'));
  });

  test('message should disappear upon successful API call', async () => {
    const responseMessage = createRandomResponseForTesting();
    jest.spyOn(api, 'default').mockResolvedValue(responseMessage);

    const user = userEvent.setup();

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

    // assert that error message exists
    expect(screen.queryByText('Please try again by sending another question.')).toBeInTheDocument();

    // dismiss alert, assert that error message disappears
    await user.click(screen.getByText('Dismiss'));
    expect(screen.queryByText('Please try again by sending another question.')).not.toBeInTheDocument();
  });
  test('message should disappear when messages cleared', async () => {
    const user = userEvent.setup();

    // assert that error message exists
    expect(screen.queryByText('Please try again by sending another question.')).toBeInTheDocument();

    // clear messages, assert that error message disappears
    await user.click(screen.getByText('Clear'));
    expect(screen.queryByText('Please try again by sending another question.')).not.toBeInTheDocument();
  });
});

describe('Disclosure', () => {
  beforeEach(async () => {
    const user = userEvent.setup();

    render(<Xpert courseId={courseId} />, { preloadedState: initialState });

    await user.click(screen.getByRole('button', { name: 'Have a question?' }));
  });
  it('clicking the toggle button opens the disclosure', async () => {
    assertDisclosureElements(true);
    assertSidebarContainerElements(true);
    assertSidebarElements(false);
  });
  it('the disclosure is hidden upon acknowledgment and sidebar is shown', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Let\'s get started.' }));

    assertDisclosureElements(false);
    assertSidebarContainerElements(true);
    assertSidebarElements(true);
  });
  it('the disclosure does not reappear when sidebar is reopened', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Let\'s get started.' }));
    await user.click(screen.getByTestId('close-button'));

    assertSidebarContainerElements(false);
    assertSidebarElements(false);

    expect(screen.getByRole('button', { name: 'Have a question?' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Have a question?' }));

    assertDisclosureElements(false);
    assertSidebarContainerElements(true);
    assertSidebarElements(true);
  });
});
