import React from 'react';
import { screen, act } from '@testing-library/react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { usePromptExperimentDecision } from '../../experiments';
import { render as renderComponent } from '../../utils/utils.test';
import { initialState } from '../../data/slice';
import { OPTIMIZELY_PROMPT_EXPERIMENT_KEY, OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS } from '../../data/optimizely';
import { showControlSurvey, showVariationSurvey } from '../../utils/surveyMonkey';

import Sidebar from '.';

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

const clearMessagesAction = 'clear-messages-action';
jest.mock('../../data/thunks', () => ({
  clearMessages: () => 'clear-messages-action',
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
    <Sidebar {...componentProps} />,
    initState,
  ));
};

describe('<Sidebar />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    usePromptExperimentDecision.mockReturnValue([]);
  });

  describe('when it\'s open', () => {
    it('should render normally', () => {
      render();
      expect(screen.queryByTestId('sidebar')).toBeInTheDocument();
    });

    it('should not render xpert if no disclosureAcknowledged', () => {
      render();
      expect(screen.queryByTestId('sidebar-xpert')).not.toBeInTheDocument();
    });

    it('should render xpert if disclosureAcknowledged', () => {
      render(undefined, { disclosureAcknowledged: true });
      expect(screen.queryByTestId('sidebar-xpert')).toBeInTheDocument();
    });

    it('should dispatch clearMessages() and call sendTrackEvent() with the expected props on clear', () => {
      render(undefined, { disclosureAcknowledged: true });

      act(() => {
        screen.queryByTestId('sidebar-clear-btn').click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(clearMessagesAction);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.learning_assistant.clear', { course_id: defaultProps.courseId });
    });
  });

  describe('when it\'s not open', () => {
    it('should not render', () => {
      render({ isOpen: false });
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });
  });

  describe('prompt experiment', () => {
    const defaultState = {
      messageList: [{
        role: 'user',
        content: 'Testing message 1',
        timestamp: +Date.now(),
      }, {
        role: 'user',
        content: 'Testing message 2',
        timestamp: +Date.now() + 1,
      }],
    };

    it('should call showVariationSurvey if experiment is enabled', () => {
      usePromptExperimentDecision.mockReturnValue([{
        enabled: true,
        variationKey: OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS.UPDATED_PROMPT,
      }]);

      render(undefined, defaultState);

      act(() => {
        screen.queryByTestId('close-button').click();
      });

      expect(showVariationSurvey).toHaveBeenCalled();
      expect(showControlSurvey).not.toHaveBeenCalled();
    });

    it('should call showControlSurvey if experiment disabled', () => {
      render(undefined, {
        ...defaultState,
        experiments: {},
      });

      act(() => {
        screen.queryByTestId('close-button').click();
      });

      expect(showControlSurvey).toHaveBeenCalled();
      expect(showVariationSurvey).not.toHaveBeenCalled();
    });

    it('should dispatch clearMessages() and call sendTrackEvent() with the expected props on clear', () => {
      usePromptExperimentDecision.mockReturnValue([{
        enabled: true,
        variationKey: OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS.UPDATED_PROMPT,
      }]);

      render(undefined, {
        ...defaultState,
        disclosureAcknowledged: true,
      });

      act(() => {
        screen.queryByTestId('sidebar-clear-btn').click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(clearMessagesAction);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.learning_assistant.clear', {
        course_id: defaultProps.courseId,
        experiment_name: OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
        variation_key: OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS.UPDATED_PROMPT,
      });
    });
  });
});
