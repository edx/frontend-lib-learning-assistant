import { useContext } from 'react';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved
import { useSelector } from 'react-redux';
import { CourseInfoContext } from '../context';

export default function useCourseUpgrade() {
  const { courseId, isUpgradeEligible } = useContext(CourseInfoContext);
  const { offer } = useModel('coursewareMeta', courseId);
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const {
    auditTrialLengthDays,
  } = useSelector(state => state.learningAssistant);

  const upgradeUrl = offer?.upgradeUrl || verifiedMode?.upgradeUrl;

  if (!isUpgradeEligible || !upgradeUrl) { return { upgradeable: false }; }

  return {
    upgradeable: true,
    auditTrialLengthDays,
    upgradeUrl,
  };
}
