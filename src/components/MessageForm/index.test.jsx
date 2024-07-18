import React from 'react';
import {
  screen, act, fireEvent, waitFor,
} from '@testing-library/react';
import { usePromptExperimentDecision } from '../../experiments';
import { render as renderComponent } from '../../utils/utils.test';
import { initialState } from '../../data/slice';
import { OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS } from '../../data/optimizely';
import {
  acknowledgeDisclosure,
  addChatMessage,
  getChatResponse,
  updateCurrentMessage,
} from '../../data/thunks';

import MessageForm from '.';

jest.mock('../../utils/surveyMonkey', () => ({
  showControlSurvey: jest.fn(),
  showVariationSurvey: jest.fn(),
}));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

const mockedAuthenticatedUser = { userId: 123 };
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: () => mockedAuthenticatedUser,
}));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('../../experiments', () => ({
  usePromptExperimentDecision: jest.fn(),
}));

jest.mock('../../data/thunks', () => ({
  acknowledgeDisclosure: jest.fn(),
  addChatMessage: jest.fn(),
  getChatResponse: jest.fn(),
  updateCurrentMessage: jest.fn(),
}));

const defaultProps = {
  courseId: 'some-course-id',
  isOpen: true,
  setIsOpen: jest.fn(),
  unitId: 'some-unit-id',
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
    <MessageForm {...componentProps} />,
    initState,
  ));
};

describe('<MessageForm />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    usePromptExperimentDecision.mockReturnValue([]);
  });

  describe('when rendered', () => {
    it('should focus if shouldAutofocus is enabled', () => {
      const currentMessage = 'How much wood';
      const sliceState = {
        apiIsLoading: false,
        currentMessage,
        apiError: false,
      };

      render({ shouldAutofocus: true }, sliceState);

      waitFor(() => {
        expect(screen.getByDisplayValue(currentMessage)).toHaveFocus();
      });

      expect(screen.queryByTestId('message-form')).toBeInTheDocument();
    });

    it('should dispatch updateCurrentMessage() when updating the form control', () => {
      const currentMessage = 'How much wood';
      const updatedMessage = 'How much wood coud a woodchuck chuck';
      const sliceState = {
        apiIsLoading: false,
        currentMessage,
        apiError: false,
      };

      render(undefined, sliceState);

      act(() => {
        const input = screen.getByDisplayValue(currentMessage);
        fireEvent.change(input, { target: { value: updatedMessage } });
      });

      expect(updateCurrentMessage).toHaveBeenCalledWith(updatedMessage);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('should dispatch message on submit as expected', () => {
      const currentMessage = 'How much wood could a woodchuck chuck if a woodchuck could chuck wood?';
      const sliceState = {
        apiIsLoading: false,
        currentMessage,
        apiError: false,
      };

      render(undefined, sliceState);

      act(() => {
        screen.queryByTestId('message-form-submit').click();
      });

      expect(acknowledgeDisclosure).toHaveBeenCalledWith(true);
      expect(addChatMessage).toHaveBeenCalledWith('user', currentMessage, defaultProps.courseId, undefined);
      expect(getChatResponse).toHaveBeenCalledWith(defaultProps.courseId, defaultProps.unitId, undefined);
      expect(mockDispatch).toHaveBeenCalledTimes(3);
    });

    it('should not dispatch on submit if there\'s no message', () => {
      render();

      act(() => {
        screen.queryByTestId('message-form-submit').click();
      });

      expect(acknowledgeDisclosure).not.toHaveBeenCalled();
      expect(addChatMessage).not.toHaveBeenCalled();
      expect(getChatResponse).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('prmpt experiment', () => {
    beforeEach(() => {
      usePromptExperimentDecision.mockReturnValue([{
        enabled: true,
        variationKey: OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS.UPDATED_PROMPT,
      }]);
    });

    it('should include experiment data on submit', () => {
      const currentMessage = 'How much wood could a woodchuck chuck if a woodchuck could chuck wood?';
      const sliceState = {
        apiIsLoading: false,
        currentMessage,
        apiError: false,
      };

      render(undefined, sliceState);

      act(() => {
        screen.queryByTestId('message-form-submit').click();
      });

      expect(acknowledgeDisclosure).toHaveBeenCalledWith(true);
      expect(addChatMessage).toHaveBeenCalledWith(
        'user',
        currentMessage,
        defaultProps.courseId,
        OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS.UPDATED_PROMPT,
      );
      expect(getChatResponse).toHaveBeenCalledWith(
        defaultProps.courseId,
        defaultProps.unitId,
        OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS.UPDATED_PROMPT,
      );
      expect(mockDispatch).toHaveBeenCalledTimes(3);
    });
  });
});
