import PropTypes from 'prop-types';
import { useState } from 'react';
import ToggleXpert from '../components/ToggleXpertButton';
import Sidebar from '../components/Sidebar';

const Xpert = ({ courseId }) => {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

  return (
    <div>
      <ToggleXpert
        courseId={courseId}
        isOpen={sidebarIsOpen}
        setIsOpen={setSidebarIsOpen}
      />
      <Sidebar
        courseId={courseId}
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
