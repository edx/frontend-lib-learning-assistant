import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../utils/utils.test';

import TrialDisclosure from '.';

const PRIVACY_POLICY_URL = 'https://some.url/policy';
jest.mock('@edx/frontend-platform/config', () => ({
  ensureConfig: jest.fn(),
  getConfig: () => ({ PRIVACY_POLICY_URL }),
}));

describe('<TrialDisclosure />', () => {
  let container;

  describe('When trial upgrade is not being shown', () => {
    beforeEach(() => {
      ({ container } = render(<TrialDisclosure><span>Children</span></TrialDisclosure>));
    });

    it('should have a link to the privacy policy url', () => {
      const link = screen.queryByText('privacy policy');

      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', PRIVACY_POLICY_URL);
    });

    it('should not show the trial message', () => {
      const upgrade = screen.queryByText('Free trial, then upgrade course for full access to Xpert features.');

      expect(upgrade).not.toBeInTheDocument();
    });

    it('should match snapshot', () => {
      expect(container).toMatchSnapshot();
    });
  });

  describe('When trial upgrade being shown', () => {
    beforeEach(() => {
      ({ container } = render(<TrialDisclosure showTrial><span>Children</span></TrialDisclosure>));
    });

    it('should show the trial message', () => {
      const upgrade = screen.queryByText('Free trial, then upgrade course for full access to Xpert features.');

      expect(upgrade).toBeInTheDocument();
    });

    it('should match snapshot', () => {
      expect(container).toMatchSnapshot();
    });
  });
});
