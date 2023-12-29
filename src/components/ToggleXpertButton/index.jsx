import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  Button,
  Icon,
  IconButton,
  ProductTour,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

import { ReactComponent as XpertLogo } from '../../assets/xpert-logo.svg';
import './index.scss';

const ToggleXpert = ({
  isOpen,
  setIsOpen,
  courseId,
  contentToolsEnabled,
}) => {
  const [hasDismissed, setHasDismissed] = useState(false);
  const { userId } = getAuthenticatedUser();

  const handleClick = (event) => {
    // log event if the tool is opened
    if (!isOpen) {
      sendTrackEvent(
        'edx.ui.lms.learning_assistant.launch',
        {
          course_id: courseId,
          user_id: userId,
          source: event.target.id === 'toggle-button' ? 'toggle' : 'cta',
        },
      );
    }
    setIsOpen(!isOpen);
  };

  const handleDismiss = (event) => {
    // prevent default and propagation to prevent sidebar from opening
    event.preventDefault();
    event.stopPropagation();
    setHasDismissed(true);
    localStorage.setItem('dismissedLearningAssistantCallToAction', 'true');
    sendTrackEvent('edx.ui.lms.learning_assistant.dismiss_action_message', {
      course_id: courseId,
    });
  };

  const handleProductTourEnd = () => {
    setIsOpen(true);
    localStorage.setItem('completedLearningAssistantTour', 'true');
    sendTrackEvent(
      'edx.ui.lms.learning_assistant.launch',
      {
        course_id: courseId,
        user_id: userId,
        source: 'product-tour',
      },
    );
  };

  const learningAssistantTour = {
    tourId: 'learningAssistantTour',
    endButtonText: 'Check it out',
    onEnd: () => { handleProductTourEnd(); },
    enabled: !localStorage.getItem('completedLearningAssistantTour'),
    checkpoints: [
      {
        placement: 'left',
        target: '#cta-button',
        body: 'Xpert is a new part of your learning experience. '
          + 'You can ask questions and get tutoring help during your course.',
      },
    ],
  };

  return (
    (!isOpen && (
    <>
      <ProductTour tours={[learningAssistantTour]} />
      <div className={
          `toggle closed d-flex flex-column position-fixed justify-content-end align-items-end mx-3 border-0 
          ${contentToolsEnabled ? 'chat-content-tools-margin' : ''}`
        }
      >
        {(!localStorage.getItem('dismissedLearningAssistantCallToAction') && !hasDismissed) && (
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
        >
          <XpertLogo />
        </Button>
      </div>
    </>
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
