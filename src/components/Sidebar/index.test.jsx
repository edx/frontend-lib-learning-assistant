import React from 'react';
import { screen } from '@testing-library/react';
import { render, act } from '../../utils/utils.test';
import { initialState } from '../../data/slice';
import { PROMPT_EXPERIMENT_FLAG, PROMPT_EXPERIMENT_KEY } from '../../constants/experiments';
import { showControlSurvey, showVariationSurvey } from '../../utils/surveyMonkey';

import Sidebar from '.';

jest.mock('../../utils/surveyMonkey', () => ({
  showControlSurvey: jest.fn(),
  showVariationSurvey: jest.fn(),
}));

const defaultProps = {
  courseId: 'some-course-id',
  isOpen: true,
  setIsOpen: jest.fn(),
  unitId: 'some-unit-id',
};

const renderSidebar = async (props = {}, sliceState = {}) => {
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
  return act(async () => render(
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
      renderSidebar();
      expect(screen.queryByTestId('sidebar')).toBeInTheDocument();
    });

    it('should not render xpert if no disclosureAcknowledged', () => {
      renderSidebar();
      expect(screen.queryByTestId('sidebar-xpert')).not.toBeInTheDocument();
    });

    it('should render xpert if disclosureAcknowledged', () => {
      renderSidebar(undefined, { disclosureAcknowledged: true });
      expect(screen.queryByTestId('sidebar-xpert')).toBeInTheDocument();
    });
  });

  describe('when it\'s not open', () => {
    it('should not render', () => {
      renderSidebar({ isOpen: false });
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
        timestamp: +Date.now(),
      }],
      experiments: {
        [PROMPT_EXPERIMENT_FLAG]: {
          enabled: true,
          variationKey: PROMPT_EXPERIMENT_KEY,
        },
      },
    };

    it('should call showVariationSurvey if experiment is active', async () => {
      renderSidebar(undefined, defaultState);

      await act(() => {
        screen.queryByTestId('close-button').click();
      });

      expect(showVariationSurvey).toHaveBeenCalled();
      expect(showControlSurvey).not.toHaveBeenCalled();
    });

    it('should call showControlSurvey if experiment is not active', async () => {
      renderSidebar(undefined, {
        ...defaultState,
        experiments: {},
      });

      await act(() => {
        screen.queryByTestId('close-button').click();
      });

      expect(showControlSurvey).toHaveBeenCalled();
      expect(showVariationSurvey).not.toHaveBeenCalled();
    });
  });
});
