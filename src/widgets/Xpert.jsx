import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { updateSidebarIsOpen, getLearningAssistantChatSummary } from '../data/thunks';
import ToggleXpert from '../components/ToggleXpertButton';
import Sidebar from '../components/Sidebar';
import { ExperimentsProvider } from '../experiments';
import { CourseInfoProvider } from '../context';

const Xpert = ({
  courseId,
  contentToolsEnabled,
  unitId,
  isUpgradeEligible,
}) => {
  const dispatch = useDispatch();
  const courseInfo = useMemo(
    () => ({ courseId, unitId, isUpgradeEligible }),
    [courseId, unitId, isUpgradeEligible],
  );

  const {
    isEnabled,
    sidebarIsOpen,
    auditTrial,
  } = useSelector(state => state.learningAssistant);

  const setSidebarIsOpen = (isOpen) => {
    dispatch(updateSidebarIsOpen(isOpen));
  };

  useEffect(() => {
    dispatch(getLearningAssistantChatSummary(courseId));
  }, [dispatch, courseId]);

  // NOTE: This value can be used later on if/when we pass the enrollment mode to this component
  const isAuditTrialNotExpired = () => { // eslint-disable-line no-unused-vars
    const auditTrialExpirationDate = new Date(auditTrial.expirationDate);

    if ((Date.now() - auditTrialExpirationDate) > 0) {
      return true;
    }
    return false;
  };

  return isEnabled ? (
    <CourseInfoProvider value={courseInfo}>
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
          />
        </>
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
