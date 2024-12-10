import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { updateSidebarIsOpen, getLearningAssistantChatSummary } from '../data/thunks';
import ToggleXpert from '../components/ToggleXpertButton';
import Sidebar from '../components/Sidebar';
import { ExperimentsProvider } from '../experiments';

const Xpert = ({
  courseId,
  contentToolsEnabled,
  unitId,
  isUpgradeEligible, // eslint-disable-line no-unused-vars
}) => {
  const dispatch = useDispatch();

  const {
    isEnabled,
    sidebarIsOpen,
  } = useSelector(state => state.learningAssistant);

  const setSidebarIsOpen = (isOpen) => {
    dispatch(updateSidebarIsOpen(isOpen));
  };

  useEffect(() => {
    dispatch(getLearningAssistantChatSummary(courseId));
  }, [dispatch, courseId]);

  return isEnabled ? (
    <ExperimentsProvider>
      <>
        <ToggleXpert
          courseId={courseId}
          isOpen={sidebarIsOpen}
          setIsOpen={setSidebarIsOpen}
          contentToolsEnabled={contentToolsEnabled}
        />
        <Sidebar
          courseId={courseId}
          isOpen={sidebarIsOpen}
          setIsOpen={setSidebarIsOpen}
          unitId={unitId}
          isUpgradeEligible={isUpgradeEligible}
        />
      </>
    </ExperimentsProvider>
  ) : null;
};

Xpert.propTypes = {
  courseId: PropTypes.string.isRequired,
  contentToolsEnabled: PropTypes.bool.isRequired,
  unitId: PropTypes.string.isRequired,
  isUpgradeEligible: PropTypes.bool.isRequired,
};

export default Xpert;
