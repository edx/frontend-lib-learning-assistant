import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  Button,
  Icon,
  IconButton,
  ModalCloseButton,
  ModalPopup,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

import { OPTIMIZELY_PROMPT_EXPERIMENT_KEY } from '../../data/optimizely';
import { ReactComponent as XpertLogo } from '../../assets/xpert-logo.svg';
import './index.scss';
import { usePromptExperimentDecision } from '../../experiments';

const ToggleXpert = ({
  isOpen,
  setIsOpen,
  courseId,
  contentToolsEnabled,
}) => {
  const [hasDismissedCTA, setHasDismissedCTA] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [target, setTarget] = useState(null);
  const { userId } = getAuthenticatedUser();

  const [decision] = usePromptExperimentDecision();
  const { enabled, variationKey } = decision || {};
  const experimentPayload = enabled ? {
    experiment_name: OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
    variation_key: variationKey,
  } : {};

  const handleClick = (event) => {
    // log event if the tool is opened
    if (!isOpen) {
      sendTrackEvent(
        'edx.ui.lms.learning_assistant.launch',
        {
          course_id: courseId,
          user_id: userId,
          source: event.target.id === 'toggle-button' ? 'toggle' : 'cta',
          ...experimentPayload,
        },
      );
    }
    setIsModalOpen(false);
    localStorage.setItem('completedLearningAssistantTour', 'true');
    setIsOpen(!isOpen);
  };

  const handleDismiss = (event) => {
    // prevent default and propagation to prevent sidebar from opening
    event.preventDefault();
    event.stopPropagation();
    setHasDismissedCTA(true);
    localStorage.setItem('dismissedLearningAssistantCallToAction', 'true');
    sendTrackEvent('edx.ui.lms.learning_assistant.dismiss_action_message', {
      course_id: courseId,
      ...experimentPayload,
    });
  };

  const handleModalClose = () => {
    localStorage.setItem('completedLearningAssistantTour', 'true');
    setIsModalOpen(false);
    sendTrackEvent(
      'edx.ui.lms.learning_assistant.launch',
      {
        course_id: courseId,
        user_id: userId,
        source: 'product-tour',
        ...experimentPayload,
      },
    );
  };

  const shouldDisplayCTA = (
    (!localStorage.getItem('dismissedLearningAssistantCallToAction') && !hasDismissedCTA)
    && (localStorage.getItem('completedLearningAssistantTour') || !isModalOpen)
  );

  const chatMargin = contentToolsEnabled ? 'mb-5' : 'mb-3';

  return (
    (!isOpen && (
      <div
        className={
          `toggle position-fixed closed d-flex flex-column justify-content-end align-items-end mx-3 border-0
           ${chatMargin}`
        }
        data-testid="xpert-toggle"
      >
        <div
          className="position-fixed learning-assistant-popup-modal mb-7"
        >
          <ModalPopup
            hasArrow
            placement="left"
            positionRef={target}
            isOpen={isModalOpen && !localStorage.getItem('completedLearningAssistantTour')}
            onClose={handleModalClose}
          >
            <div
              className={`bg-white p-3 rounded shadow border ${chatMargin}`}
              style={{ textAlign: 'start' }}
            >
              <p data-testid="modal-message">
                Xpert is a new part of your learning experience.<br />
                You can ask questions and get tutoring help during your course.
              </p>
              <div className="d-flex justify-content-start" style={{ gap: '10px' }}>
                <ModalCloseButton variant="outline-primary" data-testid="close-button">Close</ModalCloseButton>
                <Button
                  variant="primary"
                  className="mie-2"
                  onClick={handleClick}
                  data-testid="check-button"
                >
                  Check it out
                </Button>
              </div>
            </div>
          </ModalPopup>
        </div>
        { shouldDisplayCTA && (
          <div
            className="d-flex justify-content-end flex-row "
            data-testid="action-message"
          >
            <IconButton
              src={Close}
              iconAs={Icon}
              alt="dismiss"
              onClick={handleDismiss}
              variant="light"
              className="dismiss-button mx-2 mt-1 bg-gray"
              size="sm"
              data-testid="dismiss-button"
            />
            <button
              className="action-message open-negative-margin p-3 mb-4.5"
              data-testid="message-button"
              onClick={handleClick}
              aria-label="Can I answer any questions for you?"
              type="button"
              id="cta-button"
            >
              <span>
                Hi there! 👋 I&apos;m Xpert,
                an AI-powered assistant from edX who can help you with questions about this course.
              </span>
            </button>
          </div>
        )}
        <Button
          variant="primary"
          className="toggle button-icon"
          data-testid="toggle-button"
          onClick={handleClick}
          id="toggle-button"
          ref={setTarget}
        >
          <XpertLogo />
        </Button>
      </div>
    ))
  );
};

ToggleXpert.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  courseId: PropTypes.string.isRequired,
  contentToolsEnabled: PropTypes.bool.isRequired,
};

export default ToggleXpert;
