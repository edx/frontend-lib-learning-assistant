import { useContext } from 'react';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved
import { useSelector } from 'react-redux';
import { CourseInfoContext } from '../context';

import { OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS } from '../data/optimizely';
import { useAuditTrialExperimentDecision } from '../experiments';

const millisecondsInOneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

/**
 * @typedef AuditTrial
 * @type {object}
 * @property {string} startDate Date String of when the Trial started.
 * @property {string} expirationDate Date String of when the Trial ends.
 */

/**
 * @typedef CourseUpgradeInfo
 * @type {object}
 * @property {boolean} upgradeable Should this user see a trial/upgrade option?.
 * @property {number} [auditTrialLengthDays] Audit Trial full length in days.
 * @property {number} [auditTrialDaysRemaining] Remaining day for the current trial (if any).
 * @property {boolean} [auditTrialExpired] True means that the audit has been taken and expired.
 * @property {AuditTrial} [auditTrial] The Audit trial information. Undefined if there's no trial for this user.
 * @property {string} [upgradeUrl] URL to redirect the user in case there's intention to upgrade.
 */

/**
 * This hook returns related data for the Course Upgrade.
 *
 * @returns {CourseUpgradeInfo}
 */
export default function useCourseUpgrade() {
  const { courseId, isUpgradeEligible } = useContext(CourseInfoContext);
  const {
    offer,
    accessExpiration,
    datesBannerInfo,
  } = useModel('coursewareMeta', courseId);
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const {
    auditTrialLengthDays,
    auditTrial,
  } = useSelector(state => state.learningAssistant);

  const [decision] = useAuditTrialExperimentDecision();
  const { enabled, variationKey } = decision || {};

  const upgradeUrl = offer?.upgradeUrl || verifiedMode?.upgradeUrl;

  if (
    !isUpgradeEligible
    || !upgradeUrl
    || !enabled
    || (variationKey !== OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS.XPERT_AUDIT_14_DAY_TRIAL
      && variationKey !== OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS.XPERT_AUDIT_28_DAY_TRIAL)
  ) { return { upgradeable: false }; }

  let auditTrialExpired = false;
  let auditTrialDaysRemaining;

  if (auditTrial?.expirationDate) {
    const auditTrialExpirationDate = new Date(auditTrial.expirationDate);
    auditTrialDaysRemaining = Math.ceil((auditTrialExpirationDate - Date.now()) / millisecondsInOneDay);

    auditTrialExpired = auditTrialDaysRemaining < 0;
  }

  const isFBE = !!accessExpiration && !!datesBannerInfo?.contentTypeGatingEnabled;

  return {
    upgradeable: true,
    auditTrialLengthDays,
    auditTrialDaysRemaining,
    auditTrialExpired,
    auditTrial,
    upgradeUrl,
    isFBE,
  };
}
