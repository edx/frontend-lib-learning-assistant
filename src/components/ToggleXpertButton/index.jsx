import PropTypes from 'prop-types';
import { useState } from 'react';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { Button, Icon, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import { ReactComponent as XpertLogo } from '../../assets/xpert-logo.svg';
import './index.scss';

const ToggleXpert = ({
  isOpen,
  setIsOpen,
  courseId,
  contentToolsEnabled,
}) => {
  const [hasDismissed, setHasDismissed] = useState(false);
  const handleClick = () => {
    // log event if the tool is opened
    if (!isOpen) {
      sendTrackEvent('edx.ui.lms.learning_assistant.launch', {
        course_id: courseId,
      });
    }
    setIsOpen(!isOpen);
  };

  const handleDismiss = (event) => {
    // prevent default and propagation to prevent sidebar from opening
    event.preventDefault();
    event.stopPropagation();
    setHasDismissed(true);
    sendTrackEvent('edx.ui.lms.learning_assistant.dismiss_action_message', {
      course_id: courseId,
    });
  };

  // TODO: Remove this Segment alert. This has been added purely to diagnose whether
  //       usage issues are as a result of the Xpert toggle button not appearing.
  sendTrackEvent('edx.ui.lms.learning_assistant.render_toggle_button', {
    course_id: courseId,
  });

  return (
    (!isOpen && (
    <div className={
        `toggle closed d-flex flex-column position-fixed justify-content-end align-items-end mx-3 border-0 
        ${contentToolsEnabled ? 'chat-content-tools-margin' : ''}`
      }
    >
      {!hasDismissed && (
        <div
          className="d-flex justify-content-end flex-row"
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
          <div className="action-message open-negative-margin p-3 mb-4.5">
            <span>
              Hi there! 👋 I&apos;m Xpert,
              an AI-powered assistant from edX who can help you with questions about this course.
            </span>
          </div>
        </div>
      )}
      <Button
        variant="primary"
        className="toggle button-icon"
        data-testid="toggle-button"
        onClick={handleClick}
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
