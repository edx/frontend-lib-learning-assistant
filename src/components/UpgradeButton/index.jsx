import PropTypes from 'prop-types';
import React from 'react';

import { Button, Icon } from '@openedx/paragon';
import { LockOpen } from '@openedx/paragon/icons';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { useCourseUpgrade, useTrackEvent } from '../../hooks';
import { trackUpgradeButtonClickedOptimizely } from '../../utils/optimizelyExperiment';

import './UpgradeButton.scss';

const UpgradeButton = ({ includeLockIcon, trackingEventName }) => {
  const { upgradeUrl } = useCourseUpgrade();
  const { track } = useTrackEvent();

  const handleClick = () => {
    const { userId } = getAuthenticatedUser();
    trackUpgradeButtonClickedOptimizely(userId.toString());

    track(trackingEventName);
    track('edx.bi.ecommerce.upsell_links_clicked', {
      linkCategory: 'xpert_learning_assistant',
      linkName: 'xpert_upgrade_panel',
      linkType: 'button',
      pageName: 'in_course',
    });
  }

  return (
    <Button
      onClick={handleClick}
      href={upgradeUrl}
      className="trial-upgrade mt-3"
      variant="brand"
      data-testid="upgrade-cta"
      block
    >
      { includeLockIcon ? <Icon src={LockOpen} className="my-0 mx-2" data-testid="lock-icon" /> : null }
      Upgrade now
    </Button>
  );
};

UpgradeButton.propTypes = {
  includeLockIcon: PropTypes.bool,
  trackingEventName: PropTypes.string.isRequired,
};

UpgradeButton.defaultProps = {
  includeLockIcon: false,
};

export default UpgradeButton;
