import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { updateSidebarIsOpen, getLearningAssistantChatSummary } from '../data/thunks';
import ToggleXpert from '../components/ToggleXpertButton';
import Sidebar from '../components/Sidebar';
import { ExperimentsProvider } from '../experiments';
import { CourseInfoProvider } from '../context';

const XpertDisplay = ({
  courseId,
  contentToolsEnabled,
  unitId,
  isUpgradeEligible,
  sidebarIsOpen,
  setSidebarIsOpen,
}) => {
  const shouldDisplayXpert = isUpgradeEligible;

  const XpertSidebar = (
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
      />
    </>
  );

  return shouldDisplayXpert ? (
    <ExperimentsProvider>
      {XpertSidebar}
    </ExperimentsProvider>
  ) : null;
};

XpertDisplay.propTypes = {
  courseId: PropTypes.string.isRequired,
  contentToolsEnabled: PropTypes.bool.isRequired,
  unitId: PropTypes.string.isRequired,
  isUpgradeEligible: PropTypes.bool.isRequired,
  sidebarIsOpen: PropTypes.func.isRequired,
  setSidebarIsOpen: PropTypes.func.isRequired,
};

const Xpert = ({
  courseId,
  contentToolsEnabled,
  unitId,
  isUpgradeEligible,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getLearningAssistantChatSummary(courseId));
  }, [dispatch, courseId]);

  const courseInfo = useMemo(
    () => ({ courseId, unitId, isUpgradeEligible }),
    [courseId, unitId, isUpgradeEligible],
  );

  const {
    isEnabled,
    sidebarIsOpen,
  } = useSelector(state => state.learningAssistant);

  const setSidebarIsOpen = (isOpen) => {
    dispatch(updateSidebarIsOpen(isOpen));
  };

  return isEnabled ? (
    <CourseInfoProvider value={courseInfo}>
      <ExperimentsProvider>
        <XpertDisplay
          courseId={courseId}
          contentToolsEnabled={contentToolsEnabled}
          unitId={unitId}
          isUpgradeEligible={isUpgradeEligible}
          sidebarIsOpen={sidebarIsOpen}
          setSidebarIsOpen={setSidebarIsOpen}
        />
      </ExperimentsProvider>
    </CourseInfoProvider>
  ) : null;
};

Xpert.propTypes = {
  courseId: PropTypes.string.isRequired,
  contentToolsEnabled: PropTypes.bool.isRequired,
  unitId: PropTypes.string.isRequired,
  isUpgradeEligible: PropTypes.bool.isRequired,
};

export default Xpert;
