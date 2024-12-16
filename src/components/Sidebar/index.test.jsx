import React from 'react';
import { screen, act } from '@testing-library/react';

import { usePromptExperimentDecision } from '../../experiments';
import { render as renderComponent } from '../../utils/utils.test';
import { initialState } from '../../data/slice';
import showSurvey from '../../utils/surveyMonkey';
import { useCourseUpgrade, useTrackEvent } from '../../hooks';

import Sidebar from '.';

jest.mock('../../utils/surveyMonkey', () => jest.fn());

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

jest.mock('../../hooks', () => ({
  useCourseUpgrade: jest.fn(),
  useTrackEvent: jest.fn(),
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
    useCourseUpgrade.mockReturnValue({ upgradeable: false });
    useTrackEvent.mockReturnValue({ track: jest.fn() });
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

    it('should not render xpert if audit trial is expired', () => {
      useCourseUpgrade.mockReturnValue({
        upgradeable: true,
        auditTrialExpired: true,
      });
      render();
      expect(screen.queryByTestId('sidebar-xpert')).not.toBeInTheDocument();
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

    it('should call showSurvey', () => {
      render(undefined, {
        ...defaultState,
        experiments: {},
      });

      act(() => {
        screen.queryByTestId('close-button').click();
      });

      expect(showSurvey).toHaveBeenCalled();
    });
  });
});
