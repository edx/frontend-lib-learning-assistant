import React from 'react';
import { render } from '../../utils/utils.test';
import { useCourseUpgrade, useTrackEvent } from '../../hooks';

import UpgradePanel from '.';

jest.mock('../../hooks', () => ({
  useCourseUpgrade: jest.fn(),
  useTrackEvent: jest.fn(),
}));

describe('UpgradePanel', () => {
  beforeEach(() => {
    useCourseUpgrade.mockReturnValue({ upgradeUrl: 'www.test.com' });
    useTrackEvent.mockReturnValue({ track: jest.fn() });
  });

  it('displays correct bullet points if not FBE', () => {
    useCourseUpgrade.mockReturnValue({
      upgradeUrl: 'www.test.com',
      isFBE: false,
    });

    expect(render(<UpgradePanel />)).toMatchSnapshot();
  });

  it('displays correct bullet points if FBE', () => {
    useCourseUpgrade.mockReturnValue({
      upgradeUrl: 'www.test.com',
      isFBE: true,
    });

    expect(render(<UpgradePanel />)).toMatchSnapshot();
  });
});
