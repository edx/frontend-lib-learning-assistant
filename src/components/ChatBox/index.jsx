import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Message from '../Message';
import './ChatBox.scss';
import MessageDivider from '../MessageDivider';

function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear()
  );
}

// container for all of the messages
const ChatBox = ({ chatboxContainerRef }) => {
  const { messageList, apiIsLoading } = useSelector(state => state.learningAssistant);
  const messagesBeforeToday = messageList.filter((m) => (!isToday(new Date(m.timestamp))));
  const messagesToday = messageList.filter((m) => (isToday(new Date(m.timestamp))));

  // message divider should not display if no messages or if all messages sent today.
  return (
    <div ref={chatboxContainerRef} className="flex-grow-1 scroller d-flex flex-column pb-4">
      {messagesBeforeToday.map(({ role, content, timestamp }) => (
        <Message key={timestamp} variant={role} message={content} />
      ))}
      {(messageList.length !== 0 && messagesBeforeToday.length !== 0) && (<MessageDivider text="Today" />)}
      {messagesToday.map(({ role, content, timestamp }) => (
        <Message key={timestamp} variant={role} message={content} />
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
