import React from 'react';

import { useCourseUpgrade } from '../../hooks';
import UpsellContent from './UpsellBullets';
import UpgradeButton from '../UpgradeButton';

import './UpgradePanel.scss';

const UpgradePanel = () => {
  const { isFBE } = useCourseUpgrade();

  return (
    <div className="upgrade-panel d-flex flex-column align-items-stretch px-4 py-3">
      <h2 className="text-light-100">
        Upgrade this course
      </h2>
      <UpsellContent isFBE={isFBE} />
      <UpgradeButton includeLockIcon trackingEventName="edx.ui.lms.learning_assistant.expired_upgrade_click" />
    </div>
  );
};

export default UpgradePanel;
