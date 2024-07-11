import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { render as renderComponent } from '../../utils/utils.test';
import { initialState } from '../../data/slice';
import { PROMPT_EXPERIMENT_FLAG, PROMPT_EXPERIMENT_KEY } from '../../constants/experiments';

import ToggleXpert from '.';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

const mockedAuthenticatedUser = { userId: 123 };
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: () => mockedAuthenticatedUser,
}));

const defaultProps = {
  isOpen: false,
  setIsOpen: jest.fn(),
  courseId: 'some-course-id',
  contentToolsEnabled: true,
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
  return renderComponent(
    <ToggleXpert {...componentProps} />,
    initState,
  );
};

describe('<ToggleXpert />', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  describe('when it\'s closed', () => {
    it('should render the component', () => {
      render();
      expect(screen.queryByTestId('xpert-toggle')).toBeInTheDocument();
    });

    it('should track the "Check it out" action', () => {
      render();

      screen.queryByTestId('check-button').click();

      expect(sendTrackEvent).toHaveBeenCalledWith(
        'edx.ui.lms.learning_assistant.launch',
        {
          course_id: defaultProps.courseId,
          user_id: mockedAuthenticatedUser.userId,
          source: 'cta',
        },
      );
    });

    it('should track the toggle action', () => {
      render();

      screen.queryByTestId('toggle-button').click();

      expect(sendTrackEvent).toHaveBeenCalledWith(
        'edx.ui.lms.learning_assistant.launch',
        {
          course_id: defaultProps.courseId,
          user_id: mockedAuthenticatedUser.userId,
          source: 'toggle',
        },
      );
    });

    it('should track the dismiss action', async () => {
      render();

      // Show CTA
      await screen.queryByTestId('check-button').click();

      await waitFor(() => expect(screen.queryByTestId('dismiss-button')).toBeInTheDocument());

      // Dismiss it
      await screen.queryByTestId('dismiss-button').click();

      expect(sendTrackEvent).toHaveBeenCalledWith(
        'edx.ui.lms.learning_assistant.dismiss_action_message',
        {
          course_id: defaultProps.courseId,
        },
      );
    });
  });

  describe('when it\'s open', () => {
    it('should not render', () => {
      render({ isOpen: true });
      expect(screen.queryByTestId('xpert-toggle')).not.toBeInTheDocument();
    });
  });

  describe('prompt experiment', () => {
    const defaultState = {
      experiments: {
        [PROMPT_EXPERIMENT_FLAG]: {
          enabled: true,
          variationKey: PROMPT_EXPERIMENT_KEY,
        },
      },
    };

    it('should render the component', () => {
      render();
      expect(screen.queryByTestId('xpert-toggle')).toBeInTheDocument();
    });

    it('should track the "Check it out" action', () => {
      render(undefined, defaultState);

      screen.queryByTestId('check-button').click();

      expect(sendTrackEvent).toHaveBeenCalledWith(
        'edx.ui.lms.learning_assistant.launch',
        {
          course_id: defaultProps.courseId,
          user_id: mockedAuthenticatedUser.userId,
          source: 'cta',
          experiment_name: PROMPT_EXPERIMENT_FLAG,
          variation_key: PROMPT_EXPERIMENT_KEY,
        },
      );
    });

    it('should track the toggle action', () => {
      render(undefined, defaultState);

      screen.queryByTestId('toggle-button').click();

      expect(sendTrackEvent).toHaveBeenCalledWith(
        'edx.ui.lms.learning_assistant.launch',
        {
          course_id: defaultProps.courseId,
          user_id: mockedAuthenticatedUser.userId,
          source: 'toggle',
          experiment_name: PROMPT_EXPERIMENT_FLAG,
          variation_key: PROMPT_EXPERIMENT_KEY,
        },
      );
    });

    it('should track the dismiss action', async () => {
      render(undefined, defaultState);

      // Show CTA
      await screen.queryByTestId('check-button').click();

      await waitFor(() => expect(screen.queryByTestId('dismiss-button')).toBeInTheDocument());

      // Dismiss it
      await screen.queryByTestId('dismiss-button').click();

      expect(sendTrackEvent).toHaveBeenCalledWith(
        'edx.ui.lms.learning_assistant.dismiss_action_message',
        {
          course_id: defaultProps.courseId,
          experiment_name: PROMPT_EXPERIMENT_FLAG,
          variation_key: PROMPT_EXPERIMENT_KEY,
        },
      );
    });
  });
});
