import React from 'react';
import './Message.css';
import PropTypes from 'prop-types';

const Message = ({ variant, message, timestamp }) => {
  if (!timestamp) {
    return null;
  }
  return (
    <div className={`msg ${variant}`}>
      {message}
      <div className="time">{`${timestamp?.getHours()}:${timestamp?.getMinutes()}:${timestamp?.getSeconds()}`}</div>
    </div>
  );
};

Message.propTypes = {
  variant: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  timestamp: PropTypes.instanceOf(Date).isRequired,
};

export default Message;
