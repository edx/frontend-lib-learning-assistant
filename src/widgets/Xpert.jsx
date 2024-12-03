import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { updateSidebarIsOpen, getLearningAssistantSummary } from '../data/thunks';
import ToggleXpert from '../components/ToggleXpertButton';
import Sidebar from '../components/Sidebar';
import { ExperimentsProvider } from '../experiments';
// import { getLearningAssistantData } from '../hooks';

const Xpert = ({ courseId, contentToolsEnabled, unitId }) => {
  const dispatch = useDispatch();
  // getLearningAssistantData(courseId);

  const {
    isEnabled,
    sidebarIsOpen,
    auditTrial,
  } = useSelector(state => state.learningAssistant);

  const setSidebarIsOpen = (isOpen) => {
    dispatch(updateSidebarIsOpen(isOpen));
  };

  useEffect(() => {
    dispatch(getLearningAssistantSummary(courseId));
  }, [dispatch, courseId]);

  // NOTE: This value can be used later on if/when we pass the enrollment mode to this componentn
  const isAuditTrialNotExpired = () => { // eslint-disable-line no-unused-vars
    const auditTrialExpired = (Date.now() - auditTrial.expirationDate) > 0;
    if (auditTrialExpired) {
      return true;
    }
    return false;
  };

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
        />
      </>
    </ExperimentsProvider>
  ) : null;
};

Xpert.propTypes = {
  courseId: PropTypes.string.isRequired,
  contentToolsEnabled: PropTypes.bool.isRequired,
  unitId: PropTypes.string.isRequired,
};

export default Xpert;
