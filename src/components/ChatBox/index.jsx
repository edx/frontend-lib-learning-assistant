import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Message from '../Message';
import './ChatBox.scss';

// container for all of the messages
const ChatBox = ({ chatboxContainerRef }) => {
  const { messageList, apiIsLoading } = useSelector(state => state.learningAssistant);

  return (
    <div ref={chatboxContainerRef} className="flex-grow-1 scroller d-flex flex-column pb-4">
      {messageList.map(({ role, content, timestamp }) => (
        <Message key={timestamp.toString()} variant={role} message={content} />
      ))}
      {apiIsLoading && (
        <div className="loading">Xpert is thinking</div>
      )}
    </div>
  );
};

ChatBox.propTypes = {
  chatboxContainerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
};

export default ChatBox;
