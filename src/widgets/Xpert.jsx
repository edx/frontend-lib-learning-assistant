import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ToggleXpert from '../components/ToggleXpertButton';
import Sidebar from '../components/Sidebar';
import { getChatResponse } from '../data/thunks';

const Xpert = ({ courseId }) => {
  const { messageList } = useSelector(state => state.learningAssistant);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (messageList[messageList.length - 1]?.role === 'user') {
      dispatch(getChatResponse(courseId));
    }
  }, [dispatch, courseId, messageList]);

  return (
    <div>
      <ToggleXpert isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen} courseId={courseId} />
      <Sidebar
        isOpen={sidebarIsOpen}
        setIsOpen={setSidebarIsOpen}
      />
    </div>
  );
};

Xpert.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default Xpert;
