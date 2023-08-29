import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { ReactComponent as XpertLogo } from '../../assets/xpert-logo.svg';

import './index.scss';

const ToggleXpert = ({ isOpen, setIsOpen, courseId }) => {
  const handleClick = () => {
    // log event if the tool is opened
    if (!isOpen) {
      sendTrackEvent('edx.ui.lms.learning_assistant.launch', {
        course_id: courseId,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <Button
      variant="primary"
      className="toggle closed d-flex flex-column position-fixed mx-3"
      data-testid="toggle-button"
      onClick={handleClick}
    >
      <XpertLogo />
    </Button>
  );
};

ToggleXpert.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default ToggleXpert;
