import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved
import { getConfig } from '@edx/frontend-platform';

import Xpert from './Xpert';
import { ALLOW_UPSELL_MODES, VERIFIED_MODES } from '../constants';

/**
 * XpertChatWidget - Self-sufficient plugin wrapper for XPert Learning Assistant
 *
 * This component is designed to work with the OpenEdx Frontend Plugin Framework.
 * It receives minimal context from the PluginSlot and queries everything else
 * it needs from Redux store and getConfig(), ensuring the host MFE remains
 * agnostic to XPert-specific requirements.
 *
 * @param {Object} props - Component props from PluginSlot
 * @param {string} props.courseId - Course identifier
 * @param {string} props.unitId - Current unit ID
 * @param {boolean} props.isStaff - Staff/instructor status
 * @param {string} props.enrollmentMode - Enrollment type (audit|verified|professional|etc)
 */
const XpertChatWidget = ({
  courseId,
  unitId,
  isStaff,
  enrollmentMode,
}) => {
  const config = getConfig();

  // Get exam state from Redux - don't show during exams
  const { activeAttempt, exam } = useSelector(state => state.specialExams || {});

  // Get course metadata using useModel hook (learning MFE model store abstraction)
  const course = useModel('coursewareMeta', courseId);

  // Get audit trial info from learning assistant slice (populated after summary fetch)
  const auditTrial = useSelector(state => state.learningAssistant?.auditTrial);

  // If course metadata is not loaded yet, don't render (wait for data)
  if (course === undefined) {
    return null;
  }

  // Get learning assistant enabled flag from course metadata
  const { learningAssistantEnabled } = course;

  // Get content tools setting from course attributes (calculator or notes)
  const contentToolsEnabled = course.showCalculator || course.notes?.enabled;

  // Check if learning assistant is enabled for this course
  if (learningAssistantEnabled === false) {
    return null;
  }

  // Don't show during exams
  if (activeAttempt?.attempt_id || exam?.id) {
    return null;
  }

  // Require enrollment or staff status
  if (!isStaff && !enrollmentMode) {
    return null;
  }

  // Check enrollment mode permissions
  const verifiedMode = VERIFIED_MODES.includes(enrollmentMode);

  // Determine if user is in an audit-eligible mode
  // Note: We allow access even if audit trial has expired so users can see upgrade messaging
  const isAuditEligible = (
    !isStaff
    && !verifiedMode
    && ALLOW_UPSELL_MODES.includes(enrollmentMode)
    && config.ENABLE_XPERT_AUDIT
  );

  // Allow verified users, audit-eligible users (including expired), or staff
  if (!isStaff && !(verifiedMode || isAuditEligible)) {
    return null;
  }

  // Calculate if audit trial is active (for passing to Xpert as isUpgradeEligible)
  const nowIso = new Date().toISOString();
  const auditExpired = auditTrial?.expirationDate ? auditTrial.expirationDate < nowIso : false;
  const hasActiveAuditTrial = isAuditEligible && !auditExpired;

  // Validate course dates
  if (course) {
    const { accessExpiration, start, end } = course;
    const utcDate = (new Date()).toISOString();
    const expiration = accessExpiration?.expirationDate || utcDate;

    const validDate = (
      (start ? start <= utcDate : true)
      && (end ? end >= utcDate : true)
      && (hasActiveAuditTrial ? expiration >= utcDate : true)
    );

    if (!validDate) {
      return null;
    }
  }

  return (
    <Xpert
      courseId={courseId}
      unitId={unitId}
      contentToolsEnabled={contentToolsEnabled}
      isUpgradeEligible={hasActiveAuditTrial}
      enableChatV2Endpoint={config.FEATURE_ENABLE_CHAT_V2_ENDPOINT}
    />
  );
};

XpertChatWidget.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  isStaff: PropTypes.bool.isRequired,
  enrollmentMode: PropTypes.string,
};

XpertChatWidget.defaultProps = {
  enrollmentMode: null,
};

export default XpertChatWidget;
