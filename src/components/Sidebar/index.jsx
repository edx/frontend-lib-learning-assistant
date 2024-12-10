import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Icon,
  IconButton,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

import { useCourseUpgrade } from '../../hooks';
import showSurvey from '../../utils/surveyMonkey';

import APIError from '../APIError';
import ChatBox from '../ChatBox';
import Disclosure from '../Disclosure';
import UpgradePanel from '../UpgradePanel';
import MessageForm from '../MessageForm';
import { ReactComponent as XpertLogo } from '../../assets/xpert-logo.svg';
import './Sidebar.scss';

const Sidebar = ({
  courseId,
  isOpen,
  setIsOpen,
  unitId,
  isUpgradeEligible,
}) => {
  const {
    apiError,
    auditTrial,
    disclosureAcknowledged,
    messageList,
  } = useSelector(state => state.learningAssistant);

  const { upgradeable, auditTrialExpired } = useCourseUpgrade();

  const chatboxContainerRef = useRef(null);

  // this use effect is intended to scroll to the bottom of the chat window, in the case
  // that a message is larger than the chat window height.
  useEffect(() => {
    const messageContainer = chatboxContainerRef.current;

    if (messageContainer) {
      const { scrollHeight, clientHeight } = messageContainer;
      const maxScrollTop = scrollHeight - clientHeight;
      const duration = 200;

      if (maxScrollTop > 0) {
        const startTime = Date.now();
        const endTime = startTime + duration;

        const scroll = () => {
          const currentTime = Date.now();
          const timeFraction = (currentTime - startTime) / duration;
          const scrollTop = maxScrollTop * timeFraction;

          messageContainer.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
          });

          if (currentTime < endTime) {
            requestAnimationFrame(scroll);
          }
        };

        requestAnimationFrame(scroll);
      }
    }
  }, [messageList, isOpen, apiError]);

  const handleClick = () => {
    setIsOpen(false);

    if (messageList.length >= 2) {
      showSurvey();
    }
  };

  const getMessageForm = () => (
    <MessageForm courseId={courseId} shouldAutofocus unitId={unitId} />
  );

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
        // TODO: Show the upgrade screen instead of this banner
        return (
          <div>
            Your trial has expired. <a href=''>Upgrade</a> for full access to Xpert.
          </div>
        );
      };
    }
  };

  /**
   * if no audit trial, and chat message endpoint success,
   * we know an audit trial just started so write "[xpert_trial_length] days"
   * and re-call the chat summary endpoint
  */
  const getSidebar = () => (
    <div className="h-100 d-flex flex-column justify-content-stretch" data-testid="sidebar-xpert">
      <div className="p-3 sidebar-header" data-testid="sidebar-xpert-header">
        <XpertLogo />
      </div>
      {}
      <div className="p-3 trial-header">
        {getDaysRemainingMessage()}
      </div>
      <span className="separator" />
      <ChatBox
        chatboxContainerRef={chatboxContainerRef}
        messageList={messageList}
      />
      {
        apiError
        && (
          <div className="d-flex flex-column p-3 mt-auto">
            <APIError />
          </div>
        )
      }
      {getMessageForm()}
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
          className="chat-close position-absolute m-2 border-0"
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
  isUpgradeEligible: PropTypes.bool.isRequired,
};

export default Sidebar;
