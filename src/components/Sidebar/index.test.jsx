import React from 'react';
import { fireEvent, screen, act } from '@testing-library/react';

import { usePromptExperimentDecision } from '../../experiments';
import {
  useCourseUpgrade, useTrackEvent,
} from '../../hooks';
import { render as renderComponent } from '../../utils/utils.test';
import { initialState } from '../../data/slice';
import showSurvey from '../../utils/surveyMonkey';

import Sidebar from '.';

jest.mock('../../hooks', () => ({
  useCourseUpgrade: jest.fn(),
  useTrackEvent: jest.fn(),
}));

jest.mock('../../utils/surveyMonkey', () => jest.fn());

jest.mock('../../utils/optimizelyExperiment', () => ({
  trackUpgradeButtonClickedOptimizely: jest.fn(),
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
  beforeEach(async () => {
    jest.resetAllMocks();
    useCourseUpgrade.mockReturnValue({ upgradeable: false });
    usePromptExperimentDecision.mockReturnValue([]);
    useCourseUpgrade.mockReturnValue([]);
    useTrackEvent.mockReturnValue({ track: jest.fn() });
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

    it('If auditTrialDaysRemaining not yet defined, show days remaining', () => {
      useCourseUpgrade.mockReturnValue({
        upgradeable: true,
        upgradeUrl: 'https://mockurl.com',
        auditTrialDaysRemaining: undefined,
      });
      render(undefined, { disclosureAcknowledged: true });
      expect(screen.queryByTestId('sidebar-xpert')).toBeInTheDocument();
      expect(screen.queryByTestId('get-days-remaining-message')).toBeInTheDocument();
      expect(screen.queryByTestId('days-remaining-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('days-remaining-message')).not.toBeInTheDocument();
    });

    it('If auditTrialDaysRemaining > 1, show days remaining', () => {
      useCourseUpgrade.mockReturnValue({
        upgradeable: true,
        upgradeUrl: 'https://mockurl.com',
        auditTrialDaysRemaining: 2,
      });
      render(undefined, { disclosureAcknowledged: true });
      expect(screen.queryByTestId('sidebar-xpert')).toBeInTheDocument();
      expect(screen.queryByTestId('get-days-remaining-message')).toBeInTheDocument();
      expect(screen.queryByTestId('days-remaining-message')).toBeInTheDocument();
      expect(screen.queryByTestId('days-remaining-spinner')).not.toBeInTheDocument();
    });

    it('If auditTrialDaysRemaining === 1, say final day', () => {
      useCourseUpgrade.mockReturnValue({
        upgradeable: true,
        upgradeUrl: 'https://mockurl.com',
        auditTrialDaysRemaining: 1,
      });
      render(undefined, { disclosureAcknowledged: true });
      expect(screen.queryByTestId('sidebar-xpert')).toBeInTheDocument();
      expect(screen.queryByTestId('get-days-remaining-message')).toBeInTheDocument();
      expect(screen.queryByTestId('trial-ends-today-message')).toBeInTheDocument();
      expect(screen.queryByTestId('days-remaining-spinner')).not.toBeInTheDocument();
    });

    it('should call track event on click', () => {
      useCourseUpgrade.mockReturnValue({
        upgradeable: true,
        upgradeUrl: 'https://mockurl.com',
        auditTrialDaysRemaining: 1,
      });
      const mockedTrackEvent = jest.fn();
      useTrackEvent.mockReturnValue({ track: mockedTrackEvent });

      render(undefined, { disclosureAcknowledged: true });
      const upgradeLink = screen.queryByTestId('days_remaining_banner_upgrade_link');
      expect(mockedTrackEvent).not.toHaveBeenCalled();
      fireEvent.click(upgradeLink);

      expect(mockedTrackEvent).toHaveBeenCalledWith('edx.ui.lms.learning_assistant.days_remaining_banner_upgrade_click');
      expect(mockedTrackEvent).toHaveBeenCalledWith(
        'edx.bi.ecommerce.upsell_links_clicked',
        {
          linkCategory: 'xpert_learning_assistant',
          linkName: 'xpert_days_remaining_banner',
          linkType: 'button',
          pageName: 'in_course',
        },
      );
    });

    it('If auditTrialDaysRemaining < 1, do not show either of those', () => {
      useCourseUpgrade.mockReturnValue({
        upgradeable: true,
        upgradeUrl: 'https://mockurl.com',
        auditTrialDaysRemaining: 0,
      });
      render(undefined, { disclosureAcknowledged: true });
      expect(screen.queryByTestId('sidebar-xpert')).toBeInTheDocument();
      expect(screen.queryByTestId('get-days-remaining-message')).not.toBeInTheDocument();
      expect(screen.queryByTestId('days-remaining-message')).not.toBeInTheDocument();
      expect(screen.queryByTestId('trial-ends-today-message')).not.toBeInTheDocument();
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
