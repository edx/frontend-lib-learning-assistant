import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved

import { updateSidebarIsOpen, getLearningAssistantChatSummary } from '../data/thunks';
import ToggleXpert from '../components/ToggleXpertButton';
import Sidebar from '../components/Sidebar';
import { OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS } from '../data/optimizely';
import { ExperimentsProvider, useAuditTrialExperimentDecision } from '../experiments';
import { CourseInfoProvider } from '../context';

const Xpert = ({
  courseId,
  contentToolsEnabled,
  unitId,
  isUpgradeEligible,
}) => {
  const dispatch = useDispatch();

  const {
    isStaff,
  } = useModel('courseHomeMeta', courseId);

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

  const [decision] = useAuditTrialExperimentDecision();
  const { enabled: experimentEnabled, variationKey } = decision || {};

  // if a user is not part of the experiment, not part of the control, or not eligible for upgrade, they should
  // still see xpert
  const shouldDisplayXpert = (
    !experimentEnabled
    || !(variationKey === OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS.CONTROL)
    || isStaff
  );

  return isEnabled ? (
    <CourseInfoProvider value={courseInfo}>
      <ExperimentsProvider>
        { shouldDisplayXpert() ? (
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
        ) : null }
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
