import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
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
  } = useSelector(state => state.learningAssistant);

  const setSidebarIsOpen = (isOpen) => {
    dispatch(updateSidebarIsOpen(isOpen));
  };

  useEffect(() => {
    dispatch(getLearningAssistantChatSummary(courseId));
  }, [dispatch, courseId]);

  // const [auditTrialDaysRemaining, setAuditTrialDaysRemaining] = useState(null)

  // useEffect(() => {
  //   // if enrollment mode is NOT upgrade eligible, there's no audit trial data
  //   if (isUpgradeEligible) {
  //     return None

  //     // if enrollment mode IS upgrade eligible, return if the trial is expired
  //     // TEMP NOTE: A trial is auto-created if one does not yet exist so ideally this
  //     // returns true in the case that xpert is used for the first time in a course
  //     // the user is upgrade eligible in
  //   } else {
  //     // const auditTrialExpirationDate = new Date(auditTrial.expirationDate);
  //     // temp just to test this out
  //     const auditTrialExpirationDate = Date.now() + 1;

  //     const daysRemaining = Math.ceil(auditTrialExpirationDate - Date.now())
  //     console.log("daysRemaining", daysRemaining);
  //     if (daysRemaining > 0) {
  //       console.log("YEET")
  //       setAuditTrialDaysRemaining(daysRemaining);
  //       // return {
  //       //   expired: false,
  //       //   daysRemaining: daysRemaining,
  //       // };
  //     }
  //     setAuditTrialDaysRemaining(0);
  //     // return {
  //     //   expired: true,
  //     //   daysRemaining: daysRemaining,
  //     // };
  //   }
  // }, [auditTrial]);

  const getDaysRemainingMessage = () => {
    // if enrollment mode is NOT upgrade eligible, there's no audit trial data
    if (isUpgradeEligible) {
      return None

      // if enrollment mode IS upgrade eligible, return if the trial is expired
      // TEMP NOTE: A trial is auto-created if one does not yet exist so ideally this
      // returns true in the case that xpert is used for the first time in a course
      // the user is upgrade eligible in
    } else {
      const auditTrialExpirationDate = new Date(auditTrial.expirationDate);
      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      const daysRemaining = Math.ceil((auditTrialExpirationDate - Date.now()) / oneDay);

      // console.log("auditTrial:", auditTrial)
      // console.log("auditTrialExpirationDate:", auditTrialExpirationDate)
      // console.log("daysRemaining:", daysRemaining)
      if (daysRemaining > 1) {
        return (
          <div>
            {daysRemaining} days remaining. <a href=''>Upgrade</a> for full access to Xpert.
          </div>
        );
      } else if (daysRemaining === 1) {
        return (
          <div>
            Your trial ends today! <a href=''>Upgrade</a> for full access to Xpert.
          </div>
        );
      } else {
        return (
          <div>
            Your trial has expired. <a href=''>Upgrade</a> for full access to Xpert.
          </div>
        );
      };
    }
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
