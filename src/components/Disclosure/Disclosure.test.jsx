import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '../../utils/utils.test';
import { useCourseUpgrade, useTrackEvent } from '../../hooks';

import TrialDisclosure from '.';

const mockedUpgradeUrl = 'https://upgrade.edx/course/test';
const mockedAuditTrialDays = 7;

jest.mock('../../hooks', () => ({
  useCourseUpgrade: jest.fn(),
  useTrackEvent: jest.fn(() => ({ track: jest.fn() })),
}));

const PRIVACY_POLICY_URL = 'https://some.url/policy';
jest.mock('@edx/frontend-platform/config', () => ({
  ensureConfig: jest.fn(),
  getConfig: () => ({ PRIVACY_POLICY_URL }),
}));

describe('<TrialDisclosure />', () => {
  let container;

  describe('When trial upgrade is not being shown', () => {
    beforeEach(() => {
      useCourseUpgrade.mockReturnValue({ upgradeable: false });
      ({ container } = render(<TrialDisclosure><span>Children</span></TrialDisclosure>));
    });

    it('should have a link to the privacy policy url', () => {
      const link = screen.queryByText('privacy policy');

      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', PRIVACY_POLICY_URL);
    });

    it('should not show the trial message', () => {
      const upgrade = screen.queryByTestId('free-days-label');

      expect(upgrade).not.toBeInTheDocument();
    });

    it('should not show the upgrade CTA', () => {
      const upgradeCta = screen.queryByTestId('upgrade-cta');

      expect(upgradeCta).not.toBeInTheDocument();
    });

    it('should match snapshot', () => {
      expect(container).toMatchSnapshot();
    });
  });

  describe('When trial upgrade being shown', () => {
    const mockedTrackEvent = jest.fn();

    beforeEach(() => {
      useCourseUpgrade.mockReturnValue({
        upgradeable: true,
        upgradeUrl: mockedUpgradeUrl,
        auditTrialLengthDays: mockedAuditTrialDays,
      });
      useTrackEvent.mockReturnValue({ track: mockedTrackEvent });
      ({ container } = render(<TrialDisclosure showTrial><span>Children</span></TrialDisclosure>));
    });

    it('should show the trial message', () => {
      const upgrade = screen.queryByTestId('free-days-label');

      expect(upgrade.textContent).toBe(`Free for ${mockedAuditTrialDays} days, then upgrade course for full access to Xpert features.`);
    });

    it('should show the trial button with the proper href to upgrade', () => {
      const upgradeCta = screen.queryByTestId('upgrade-cta');

      expect(upgradeCta).toBeInTheDocument();
      expect(upgradeCta).toHaveAttribute('href', mockedUpgradeUrl);
    });

    it('should call the track event on click', () => {
      const upgradeCta = screen.queryByTestId('upgrade-cta');

      expect(mockedTrackEvent).not.toHaveBeenCalled();

      fireEvent.click(upgradeCta);

      expect(mockedTrackEvent).toHaveBeenCalledWith('edx.ui.lms.learning_assistant.message');
    });

    it('should match snapshot', () => {
      expect(container).toMatchSnapshot();
    });
  });
});
