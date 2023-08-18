import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Message from '../Message';
import './ChatBox.scss';

// container for all of the messages
const ChatBox = ({ messageList, chatboxContainerRef }) => {
  const [isResponseLoading, setResponseLoading] = useState(false);

  useEffect(() => {
    if (messageList[messageList.length - 1]?.role === 'user') {
      setResponseLoading(true);
    } else {
      setResponseLoading(false);
    }
  }, [messageList]);

  return (
    <div ref={chatboxContainerRef} className="scroller d-flex flex-column">
      {messageList.map(({ role, content, timestamp }) => (
        <Message key={timestamp.toString()} variant={role} message={content} timestamp={timestamp} />
      ))}
      {isResponseLoading && (
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
