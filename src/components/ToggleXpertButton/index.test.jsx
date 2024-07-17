import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { useDecision } from '@optimizely/react-sdk';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { render as renderComponent } from '../../utils/utils.test';
import { initialState } from '../../data/slice';
import { OPTIMIZELY_PROMPT_EXPERIMENT_KEY, OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS } from '../../data/optimizely';

import ToggleXpert from '.';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

const mockedAuthenticatedUser = { userId: 123 };
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: () => mockedAuthenticatedUser,
}));

jest.mock('@optimizely/react-sdk', () => ({
  useDecision: jest.fn(),
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
    useDecision.mockReturnValue([]);
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
    beforeEach(() => {
      useDecision.mockReturnValue([{
        enabled: true,
        variationKey: OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS.UPDATED_PROMPT,
      }]);
    });

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
          experiment_name: OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
          variation_key: OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS.UPDATED_PROMPT,
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
          experiment_name: OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
          variation_key: OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS.UPDATED_PROMPT,
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
          experiment_name: OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
          variation_key: OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS.UPDATED_PROMPT,
        },
      );
    });
  });
});
