import { useContext } from 'react';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved
import { useSelector } from 'react-redux';
import { CourseInfoContext } from '../context';

const millisecondsInOneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

export default function useCourseUpgrade() {
  const { courseId, isUpgradeEligible } = useContext(CourseInfoContext);
  const { offer } = useModel('coursewareMeta', courseId);
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const {
    auditTrialLengthDays,
    auditTrial,
  } = useSelector(state => state.learningAssistant);

  const upgradeUrl = offer?.upgradeUrl || verifiedMode?.upgradeUrl;

  if (!isUpgradeEligible || !upgradeUrl) { return { upgradeable: false }; }

  let auditTrialExpired = false;
  let auditTrialDaysRemaining;

  if (auditTrial?.expirationDate) {
    const auditTrialExpirationDate = new Date(auditTrial.expirationDate);
    auditTrialDaysRemaining = Math.ceil((auditTrialExpirationDate - Date.now()) / millisecondsInOneDay);

    auditTrialExpired = auditTrialDaysRemaining < 0;
  }

  return {
    upgradeable: true,
    auditTrialLengthDays,
    auditTrialDaysRemaining,
    auditTrialExpired,
    auditTrial,
    upgradeUrl,
  };
}
