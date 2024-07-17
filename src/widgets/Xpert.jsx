import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSidebarIsOpen, getIsEnabled } from '../data/thunks';
import ToggleXpert from '../components/ToggleXpertButton';
import Sidebar from '../components/Sidebar';
import ExperimentsProvider from '../optimizely';

const Xpert = ({ courseId, contentToolsEnabled, unitId }) => {
  const dispatch = useDispatch();

  const {
    isEnabled,
    sidebarIsOpen,
  } = useSelector(state => state.learningAssistant);

  const setSidebarIsOpen = (isOpen) => {
    dispatch(updateSidebarIsOpen(isOpen));
  };

  useEffect(() => {
    dispatch(getIsEnabled(courseId));
  }, [dispatch, courseId]);

  return isEnabled ? (
    <ExperimentsProvider>
      <>
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
      </>
    </ExperimentsProvider>
  ) : null;
};

Xpert.propTypes = {
  courseId: PropTypes.string.isRequired,
  contentToolsEnabled: PropTypes.bool.isRequired,
  unitId: PropTypes.string.isRequired,
};

export default Xpert;
