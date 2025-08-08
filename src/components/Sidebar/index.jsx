import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Icon,
  IconButton,
  Spinner,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

import showSurvey from '../../utils/surveyMonkey';

import APIError from '../APIError';
import ChatBox from '../ChatBox';
import Disclosure from '../Disclosure';
import MessageForm from '../MessageForm';
import UpgradePanel from '../UpgradePanel';
import { useCourseUpgrade, useTrackEvent } from '../../hooks';
import { ReactComponent as XpertLogo } from '../../assets/xpert-logo.svg';
import './Sidebar.scss';

const Sidebar = ({
  courseId,
  isOpen,
  setIsOpen,
  unitId,
}) => {
  const {
    apiError,
    disclosureAcknowledged,
    messageList,
  } = useSelector(state => state.learningAssistant);

  const {
    upgradeable, upgradeUrl, auditTrialExpired, auditTrialDaysRemaining,
  } = useCourseUpgrade();

  const { track } = useTrackEvent();

  const handleClick = () => {
    setIsOpen(false);

    if (messageList.length >= 2) {
      showSurvey();
    }
  };

  const getMessageForm = () => (
    <MessageForm courseId={courseId} shouldAutofocus unitId={unitId} />
  );

  const handleUpgradeLinkClick = () => {
    track('edx.ui.lms.learning_assistant.days_remaining_banner_upgrade_click');
    track('edx.bi.ecommerce.upsell_links_clicked', {
      linkCategory: 'xpert_learning_assistant',
      linkName: 'xpert_days_remaining_banner',
      linkType: 'button',
      pageName: 'in_course',
    });
  };

  const getUpgradeLink = () => (
    <a
      onClick={handleUpgradeLinkClick}
      target="_blank"
      href={upgradeUrl}
      rel="noreferrer"
      data-testid="days_remaining_banner_upgrade_link"
    >
      Upgrade
    </a>
  );

  const getDaysRemainingMessage = () => (
    auditTrialDaysRemaining === 1 ? (
      <div data-testid="trial-ends-today-message">
        Your trial ends today! {getUpgradeLink()} for full access to Xpert.
      </div>
    ) : (
      <div data-testid="days-remaining-message">
        {auditTrialDaysRemaining} days remaining. {getUpgradeLink()} for full access to Xpert.
      </div>
    )
  );

  const getDaysRemainingHeader = () => {
    if (!upgradeable || auditTrialDaysRemaining < 1) { return null; }

    const shouldShowSpinner = !auditTrialDaysRemaining;
    return (
      <div
        className={`trial-header ${shouldShowSpinner ? 'has-spinner' : ''}`}
        data-testid="get-days-remaining-message"
      >
        {shouldShowSpinner ? (
          <Spinner animation="border" className="spinner" data-testid="days-remaining-spinner" screenReaderText="loading" />
        ) : (
          getDaysRemainingMessage()
        )}
      </div>
    );
  };

  const getSidebar = () => (
    <div
      className="d-flex flex-column h-100"
      data-testid="sidebar-xpert"
    >
      <div className="sidebar-header" data-testid="sidebar-xpert-header">
        <XpertLogo />
      </div>

      {getDaysRemainingHeader()}

      <ChatBox messageList={messageList} />
      {
        apiError
        && (
          <div className="d-flex flex-column p-3 mt-auto">
            <APIError />
          </div>
        )
      }
      <div className="sidebar-footer">
        {getMessageForm()}
      </div>
    </div>
  );

  const getPanel = () => {
    const showUpgrade = upgradeable && auditTrialExpired;

    if (showUpgrade) {
      return <UpgradePanel />;
    }
    return (disclosureAcknowledged ? (getSidebar()) : (<Disclosure>{getMessageForm()}</Disclosure>));
  };

  return (
    isOpen && (
      <div
        className="sidebar position-fixed"
        data-testid="sidebar"
      >
        <IconButton
          className="chat-close position-absolute border-0"
          src={Close}
          iconAs={Icon}
          onClick={handleClick}
          alt="close"
          aria-label="close"
          variant="primary"
          invertColors
          data-testid="close-button"
        />
        {getPanel()}
      </div>
    )
  );
};

Sidebar.propTypes = {
  courseId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  unitId: PropTypes.string.isRequired,
};

export default Sidebar;
