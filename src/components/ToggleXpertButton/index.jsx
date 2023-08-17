import { ChevronRight } from 'react-feather';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { ReactComponent as NewXeySvg } from '../../assets/new_xey.svg';
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

  if (isOpen) {
    return (
      <button
        className="open position-fixed d-flex flex-row bg-white p-2"
        onClick={handleClick}
        type="button"
      >
        <ChevronRight size="20" color="black" />
      </button>
    );
  }

  return (
    <button
      className="closed d-flex flex-column position-fixed justify-content-end align-items-end border-0"
      onClick={handleClick}
      type="button"
    >
      <div className="open-negative-margin px-3 py-2 text-white border border-white">
        <span>Have a question?</span>
      </div>
      <div>
        <NewXeySvg width="58" />
      </div>
    </button>
  );
};

ToggleXpert.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default ToggleXpert;
