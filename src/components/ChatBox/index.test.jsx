import React from 'react';
import { screen, act } from '@testing-library/react';
import { render as renderComponent } from '../../utils/utils.test';
import { initialState, setMessageList } from '../../data/slice';
import { scrollToBottom } from '../../utils/scroll';

import ChatBox from '.';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const defaultProps = {
  chatboxContainerRef: jest.fn(),
};

jest.mock('../../utils/scroll');

const render = async (props = {}, sliceState = {}) => {
  const componentProps = {
    ...defaultProps,
    ...props,
  };

  const initState = {
    preloadedState: {
      learningAssistant: {
        ...initialState,
        ...sliceState,
      },
    },
  };

  let handlers;
  await act(async () => {
    handlers = renderComponent(
      <ChatBox {...componentProps} />,
      initState,
    );
  });

  return { ...handlers, initState, componentProps };
};

describe('<ChatBox />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('message divider does not appear when no messages', async () => {
    const messageList = [];
    const sliceState = {
      messageList,
    };
    await render(undefined, sliceState);

    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('message divider does not appear when all messages from today', async () => {
    const date = new Date();
    const messageList = [
      { role: 'user', content: 'hi', timestamp: date - 60 },
      { role: 'user', content: 'hello', timestamp: date },
    ];
    const sliceState = {
      messageList,
    };
    await render(undefined, sliceState);

    expect(screen.queryByText('hi')).toBeInTheDocument();
    expect(screen.queryByText('hello')).toBeInTheDocument();
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('message divider shows when all messages from before today', async () => {
    const date = new Date();
    const messageList = [
      { role: 'user', content: 'hi', timestamp: date.setDate(date.getDate() - 1) },
      { role: 'user', content: 'hello', timestamp: date + 1 },
    ];
    const sliceState = {
      messageList,
    };
    await render(undefined, sliceState);

    expect(screen.queryByText('hi')).toBeInTheDocument();
    expect(screen.queryByText('hello')).toBeInTheDocument();
    expect(screen.queryByText('Today')).toBeInTheDocument();
  });

  it('correctly divides old and new messages', async () => {
    const today = new Date();
    const messageList = [
      { role: 'user', content: 'Today yesterday', timestamp: today.setDate(today.getDate() - 1) },
      { role: 'user', content: 'Today today', timestamp: +Date.now() },
    ];
    const sliceState = {
      messageList,
    };
    await render(undefined, sliceState);

    const results = screen.getAllByText('Today', { exact: false });
    expect(results.length).toBe(3);
    expect(results[0]).toHaveTextContent('Today yesterday');
    expect(results[1]).toHaveTextContent('Today');
    expect(results[2]).toHaveTextContent('Today today');
  });

  it('scrolls to the last comment immediately when rendered', async () => {
    const date = new Date();
    const messageList = [
      { role: 'user', content: 'hi', timestamp: date - 60 },
      { role: 'user', content: 'hello', timestamp: date },
    ];
    const sliceState = {
      messageList,
    };

    await act(() => render(undefined, sliceState));

    const messagesContainer = screen.getByTestId('messages-container');

    expect(scrollToBottom).toHaveBeenCalledWith({ current: messagesContainer });
  });

  it('scrolls to the last comment smoothly when adding messages', async () => {
    const date = new Date();
    const messageList = [
      { role: 'user', content: 'hi', timestamp: date - 60 },
      { role: 'user', content: 'hello', timestamp: date - 30 },
    ];
    const sliceState = {
      messageList,
    };

    let store;

    await act(async () => {
      ({ store } = await render(undefined, sliceState));
    });

    const messagesContainer = screen.getByTestId('messages-container');

    expect(scrollToBottom).toHaveBeenCalledWith({ current: messagesContainer });

    act(() => {
      store.dispatch(setMessageList({
        messageList: [
          ...messageList,
          { role: 'user', content: 'New message', timestamp: +date },
        ],
      }));
    });

    expect(scrollToBottom).toHaveBeenCalledWith({ current: messagesContainer }, true);
  });
});
