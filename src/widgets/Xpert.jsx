import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ToggleXpert from '../components/ToggleXpertButton';
import Sidebar from '../components/Sidebar';
import { getChatResponse } from '../data/thunks';

const Xpert = () => {
  const { messageList } = useSelector(state => state.learningAssistant);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

  useEffect(() => {
    if (messageList[messageList.length - 1].role === 'user') {
      getChatResponse();
    }
  }, [messageList]);

  return (
    <div>
      <ToggleXpert isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen} />
      <Sidebar
        isOpen={sidebarIsOpen}
        setIsOpen={setSidebarIsOpen}
      />
    </div>
  );
};

export default Xpert;
