import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Message from '../Message';
import './ChatBox.scss';
import MessageDivider from '../MessageDivider';
import { scrollToBottom } from '../../utils/scroll';

function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear()
  );
}

// container for all of the messages
const ChatBox = () => {
  const firstRender = useRef(true);
  const messageContainerRef = useRef();

  const { messageList, apiIsLoading } = useSelector(state => state.learningAssistant);
  const messagesBeforeToday = messageList.filter((m) => (!isToday(new Date(m.timestamp))));
  const messagesToday = messageList.filter((m) => (isToday(new Date(m.timestamp))));

  useEffect(() => {
    if (firstRender.current) {
      scrollToBottom(messageContainerRef);
      firstRender.current = false;
      return;
    }

    scrollToBottom(messageContainerRef, true);
  }, [messageList.length]);

  return (
    <div className="xpert-chat-scroller">
      <div className="messages-list d-flex flex-column" ref={messageContainerRef} data-testid="messages-container">
        {messagesBeforeToday.map(({ role, content, timestamp }) => (
          <Message key={timestamp} variant={role} message={content} />
        ))}
        {/* Message divider should not display if no messages or if all messages sent today. */}
        {(messageList.length !== 0 && messagesBeforeToday.length !== 0) && (<MessageDivider text="Today" />)}
        {messagesToday.map(({ role, content, timestamp }) => (
          <Message key={timestamp} variant={role} message={content} />
        ))}
        {apiIsLoading && (
        <div className="loading">Xpert is thinking</div>
        )}
      </div>
      <span className="separator separator--top" />
      <span className="separator separator--bottom" />
    </div>
  );
};

export default ChatBox;
