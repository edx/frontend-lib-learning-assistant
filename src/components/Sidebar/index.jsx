import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  Button,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

import { clearMessages } from '../../data/thunks';
import { OPTIMIZELY_PROMPT_EXPERIMENT_KEY } from '../../data/optimizely';
import showSurvey from '../../utils/surveyMonkey';

import APIError from '../APIError';
import ChatBox from '../ChatBox';
import Disclosure from '../Disclosure';
import MessageForm from '../MessageForm';
import './Sidebar.scss';
import { usePromptExperimentDecision } from '../../experiments';

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
  const chatboxContainerRef = useRef(null);
  const dispatch = useDispatch();

  const [decision] = usePromptExperimentDecision();
  const { enabled: enabledExperiment, variationKey } = decision || {};
  const experimentPayload = enabledExperiment ? {
    experiment_name: OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
    variation_key: variationKey,
  } : {};

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

  const handleClearMessages = () => {
    dispatch(clearMessages());
    sendTrackEvent('edx.ui.lms.learning_assistant.clear', {
      course_id: courseId,
      ...experimentPayload,
    });
  };

  const getMessageForm = () => (
    <MessageForm courseId={courseId} shouldAutofocus unitId={unitId} />
  );

  const getSidebar = () => (
    <div className="h-100 d-flex flex-column justify-content-stretch" data-testid="sidebar-xpert">
      <div className="d-flex flex-column align-items-center p-3">
        <h1 className="font-weight-bold mb-3">
          Hi, I&apos;m Xpert!
        </h1>
        <p className="px-3 mb-0 text-center">
          Stuck on a concept? Need more clarification on a complicated topic?
          Let&apos;s chat!
        </p>
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
      <div className="d-flex justify-content-start">
        <Button
          className="clear mx-2 mb-2 border-0"
          onClick={handleClearMessages}
          aria-label="clear"
          variant="primary"
          type="button"
          data-testid="sidebar-clear-btn"
        >
          Clear
        </Button>
      </div>
    </div>
  );

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
          invertColors={!disclosureAcknowledged}
          data-testid="close-button"
        />
        {disclosureAcknowledged ? (getSidebar()) : (<Disclosure>{getMessageForm()}</Disclosure>)}
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
