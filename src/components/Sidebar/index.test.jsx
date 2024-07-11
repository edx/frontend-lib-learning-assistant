import React from 'react';
import { screen } from '@testing-library/react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { render as renderComponent, act } from '../../utils/utils.test';
import { initialState } from '../../data/slice';
import { PROMPT_EXPERIMENT_FLAG, PROMPT_EXPERIMENT_KEY } from '../../constants/experiments';
import { showControlSurvey, showVariationSurvey } from '../../utils/surveyMonkey';

import Sidebar from '.';

jest.mock('../../utils/surveyMonkey', () => ({
  showControlSurvey: jest.fn(),
  showVariationSurvey: jest.fn(),
}));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
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
      experiments: {
        [PROMPT_EXPERIMENT_FLAG]: {
          enabled: true,
          variationKey: PROMPT_EXPERIMENT_KEY,
        },
      },
    };

    it('should call showVariationSurvey if experiment is active', () => {
      render(undefined, defaultState);

      act(() => {
        screen.queryByTestId('close-button').click();
      });

      expect(showVariationSurvey).toHaveBeenCalled();
      expect(showControlSurvey).not.toHaveBeenCalled();
    });

    it('should call showControlSurvey if experiment is not active', () => {
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
        experiment_name: PROMPT_EXPERIMENT_FLAG,
        variation_key: PROMPT_EXPERIMENT_KEY,
      });
    });
  });
});
