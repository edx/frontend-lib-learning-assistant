import PropTypes from 'prop-types';
import React from 'react';

import { Button, Icon } from '@openedx/paragon';
import { LockOpen } from '@openedx/paragon/icons';
import { useCourseUpgrade, useTrackEvent } from '../../hooks';

import './UpgradeButton.scss';

const UpgradeButton = ({ includeLockIcon, trackingEventName }) => {
  const { upgradeUrl } = useCourseUpgrade();
  const { track } = useTrackEvent();

  const handleClick = () => track(trackingEventName);

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
