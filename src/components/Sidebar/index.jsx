import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Icon,
  IconButton,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

import showSurvey from '../../utils/surveyMonkey';

import APIError from '../APIError';
import ChatBox from '../ChatBox';
import Disclosure from '../Disclosure';
import UpgradePanel from '../UpgradePanel';
import MessageForm from '../MessageForm';
import { useCourseUpgrade } from '../../hooks';
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
    disclosureAcknowledged,
    messageList,
  } = useSelector(state => state.learningAssistant);

  const { upgradeUrl, auditTrialDaysRemaining } = useCourseUpgrade();

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
    if (auditTrialDaysRemaining > 1) {
      const irtl = new Intl.RelativeTimeFormat({ style: 'long' });
      return (
        <div>
          Your trial ends {irtl.format(auditTrialDaysRemaining, 'day')}. <a target="_blank" href={upgradeUrl} rel="noreferrer">Upgrade</a> for full access to Xpert.
        </div>
      );
    } if (auditTrialDaysRemaining === 1) {
      return (
        <div>
          Your trial ends today! <a target="_blank" href={upgradeUrl} rel="noreferrer">Upgrade</a> for full access to Xpert.
        </div>
      );
    }
    // TODO: Show the upgrade screen instead of this banner, to be done in future ticket
    return (
      <div>
        Your trial has expired. <a target="_blank" href={upgradeUrl} rel="noreferrer">Upgrade</a> for full access to Xpert.
      </div>
    );
  };

  const getSidebar = () => (
    <div className="h-100 d-flex flex-column justify-content-stretch" data-testid="sidebar-xpert">
      <div className="p-3 sidebar-header" data-testid="sidebar-xpert-header">
        <XpertLogo />
      </div>
      {isUpgradeEligible
        && (
          <div className="p-3 trial-header">
            {getDaysRemainingMessage()}
          </div>
        )}
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
