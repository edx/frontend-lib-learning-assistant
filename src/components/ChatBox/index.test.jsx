import React from 'react';
import { screen, act } from '@testing-library/react';

import { render as renderComponent } from '../../utils/utils.test';
import { initialState } from '../../data/slice';

import ChatBox from '.';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const defaultProps = {
  chatboxContainerRef: jest.fn(),
};

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
  return act(async () => renderComponent(
    <ChatBox {...componentProps} />,
    initState,
  ));
};

describe('<ChatBox />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('message divider does not appear when no messages', () => {
    const messageList = [];
    const sliceState = {
      messageList,
    };
    render(undefined, sliceState);

    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('message divider does not appear when all messages from today', () => {
    const date = new Date();
    const messageList = [
      { role: 'user', content: 'hi', timestamp: date - 60 },
      { role: 'user', content: 'hello', timestamp: date },
    ];
    const sliceState = {
      messageList,
    };
    render(undefined, sliceState);

    expect(screen.queryByText('hi')).toBeInTheDocument();
    expect(screen.queryByText('hello')).toBeInTheDocument();
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('message divider shows when all messages from before today', () => {
    const date = new Date();
    const messageList = [
      { role: 'user', content: 'hi', timestamp: date.setDate(date.getDate() - 1) },
      { role: 'user', content: 'hello', timestamp: date + 1 },
    ];
    const sliceState = {
      messageList,
    };
    render(undefined, sliceState);

    expect(screen.queryByText('hi')).toBeInTheDocument();
    expect(screen.queryByText('hello')).toBeInTheDocument();
    expect(screen.queryByText('Today')).toBeInTheDocument();
  });

  it('correctly divides old and new messages', () => {
    const today = new Date();
    const messageList = [
      { role: 'user', content: 'Today yesterday', timestamp: today.setDate(today.getDate() - 1) },
      { role: 'user', content: 'Today today', timestamp: +Date.now() },
    ];
    const sliceState = {
      messageList,
    };
    render(undefined, sliceState);

    const results = screen.getAllByText('Today', { exact: false });
    expect(results.length).toBe(3);
    expect(results[0]).toHaveTextContent('Today yesterday');
    expect(results[1]).toHaveTextContent('Today');
    expect(results[2]).toHaveTextContent('Today today');
  });
});
