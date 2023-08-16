import { ChevronRight } from 'react-feather';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { ReactComponent as NewXeySvg } from '../../assets/new_xey.svg';
import './index.css';

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
        className="fixed flex flex-row bottom-4 sidebar-open bg-white p-2 rounded-full shadow transition-all ease duration-800"
        onClick={handleClick}
        type="button"
      >
        <ChevronRight size="20" color="black" />
      </button>
    );
  }

  return (
    <button
      className="fixed justify-end bottom-4 sidebar-closed transition-all ease duration-800"
      onClick={handleClick}
      type="button"
    >
      <div className="open-negative-margin absolute bottom-16 px-4 py-2 text-white border border-white">
        <span>Have a question?</span>
      </div>
      <div className="px-4 py-2">
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
