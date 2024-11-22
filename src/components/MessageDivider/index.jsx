import React from 'react';
import './MessageDivider.scss';
import PropTypes from 'prop-types';

const MessageDivider = ({ text }) => (
  <div className="message-divider">
    {text}
  </div>
);

MessageDivider.propTypes = {
  text: PropTypes.string.isRequired,
};

export default MessageDivider;
