import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '../../utils/utils.test';
import { useCourseUpgrade, useTrackEvent } from '../../hooks';
import { trackUpgradeButtonClickedOptimizely } from '../../utils/optimizelyExperiment';

import UpgradeButton from '.';

jest.mock('../../hooks', () => ({
  useCourseUpgrade: jest.fn(),
  useTrackEvent: jest.fn(),
}));

jest.mock('../../utils/optimizelyExperiment', () => ({
  trackUpgradeButtonClickedOptimizely: jest.fn(),
}));

const mockedAuthenticatedUser = { userId: 1 };
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: () => mockedAuthenticatedUser,
}));

describe('UpgradeButton', () => {
  beforeEach(() => {
    useCourseUpgrade.mockReturnValue({ upgradeUrl: 'www.test.com' });
    useTrackEvent.mockReturnValue({ track: jest.fn() });
  });

  it('should render UpgradeButton', () => {
    render(<UpgradeButton trackingEventName="test.tracking" />);
    expect(screen.queryByText('Upgrade now')).toBeInTheDocument();
    expect(screen.queryByTestId('upgrade-cta')).toHaveAttribute('href', 'www.test.com');
    expect(screen.queryByTestId('lock-icon')).not.toBeInTheDocument();
  });

  it('should call track event on click', () => {
    const mockedTrackEvent = jest.fn();
    useTrackEvent.mockReturnValue({ track: mockedTrackEvent });

    render(<UpgradeButton trackingEventName="test.tracking" />);

    const upgradeCta = screen.queryByTestId('upgrade-cta');
    expect(mockedTrackEvent).not.toHaveBeenCalled();
    fireEvent.click(upgradeCta);

    expect(trackUpgradeButtonClickedOptimizely).toHaveBeenCalled();
    expect(mockedTrackEvent).toHaveBeenCalledWith('test.tracking');
    expect(mockedTrackEvent).toHaveBeenCalledWith(
      'edx.bi.ecommerce.upsell_links_clicked',
      {
        "linkCategory": "xpert_learning_assistant",
        "linkName": "xpert_upgrade_panel",
        "linkType": "button",
        "pageName": "in_course"
      }
    );
  });

  it('should render lock icon', () => {
    render(<UpgradeButton trackingEventName="test.tracking" includeLockIcon />);
    expect(screen.queryByTestId('lock-icon')).toBeInTheDocument();
  });
});
