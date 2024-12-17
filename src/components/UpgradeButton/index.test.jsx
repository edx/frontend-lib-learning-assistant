import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '../../utils/utils.test';
import { useCourseUpgrade, useTrackEvent } from '../../hooks';

import UpgradeButton from '.';

jest.mock('../../hooks', () => ({
  useCourseUpgrade: jest.fn(),
  useTrackEvent: jest.fn(),
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
    expect(mockedTrackEvent).toHaveBeenCalledWith('test.tracking');
  });

  it('should render lock icon', () => {
    render(<UpgradeButton trackingEventName="test.tracking" includeLockIcon />);
    expect(screen.queryByTestId('lock-icon')).toBeInTheDocument();
  });
});
