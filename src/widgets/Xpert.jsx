import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { updateSidebarIsOpen } from '../data/thunks';
import ToggleXpert from '../components/ToggleXpertButton';
import Sidebar from '../components/Sidebar';

const Xpert = ({ courseId, contentToolsEnabled, unitId }) => {
  const dispatch = useDispatch();

  const {
    sidebarIsOpen,
  } = useSelector(state => state.learningAssistant);

  const setSidebarIsOpen = (isOpen) => {
    dispatch(updateSidebarIsOpen(isOpen));
  };
  return (
    <div>
      <ToggleXpert
        courseId={courseId}
        isOpen={sidebarIsOpen}
        setIsOpen={setSidebarIsOpen}
        contentToolsEnabled={contentToolsEnabled}
      />
      <Sidebar
        courseId={courseId}
        isOpen={sidebarIsOpen}
        setIsOpen={setSidebarIsOpen}
        unitId={unitId}
      />
    </div>
  );
};

Xpert.propTypes = {
  courseId: PropTypes.string.isRequired,
  contentToolsEnabled: PropTypes.bool.isRequired,
  unitId: PropTypes.string.isRequired,
};

export default Xpert;
