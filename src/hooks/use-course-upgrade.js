import { useContext } from 'react';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved
import { useSelector } from 'react-redux';
import { CourseInfoContext } from '../context';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import {
  OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_KEY,
  OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS,
} from '../../data/optimizely';
import { useAuditTrialExperimentDecision } from '../../experiments';

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
// Update logic here to make upgrade eligible if in experiment variation
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
  const experimentPayload = enabled ? {
    experiment_name: OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_KEY,
    variation_key: variationKey,
  } : {};

  // Make upgrade eligible if in experiment variation
  if (OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS.includes(variationKey)) {
    isUpgradeEligible = true;

    // Do I need to add a sendTrackEvent call like this?
    // sendTrackEvent(
    //   'edx.ui.lms.learning_assistant.audit_trial_started',
    //   {
    //     course_id: courseId,
    //     user_id: userId,
    //     source: event.target.id === 'toggle-button' ? 'toggle' : 'cta',
    //     ...experimentPayload,
    //   },
    // );
  }


  const upgradeUrl = offer?.upgradeUrl || verifiedMode?.upgradeUrl;

  if (!isUpgradeEligible || !upgradeUrl) { return { upgradeable: false }; }

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
