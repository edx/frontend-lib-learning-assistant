import React from 'react';
import './Message.scss';
import PropTypes from 'prop-types';

const Message = ({ variant, message, timestamp }) => {
  if (!timestamp) {
    return null;
  }

  return (
    <div
      className={`message ${variant} ${variant === 'user' ? 'align-self-end' : ''} text-left my-1 mx-2 py-1 px-2`}
      data-hj-suppress
    >
      {message}
      <div className="time text-right pl-2">{`${timestamp?.getHours()}:${timestamp?.getMinutes()}:${timestamp?.getSeconds()}`}</div>
    </div>
  );
};

Message.propTypes = {
  variant: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  timestamp: PropTypes.instanceOf(Date).isRequired,
};

export default Message;
