import React from 'react';
import ReactMarkdown from 'react-markdown';
import './Message.scss';
import PropTypes from 'prop-types';

const Message = ({ variant, message }) => (
  <div
    className={`message ${variant} ${variant === 'user' ? 'align-self-end' : ''} text-left my-1 mx-4 py-2 px-3`}
    data-hj-suppress
  >
    <ReactMarkdown>
      {message}
    </ReactMarkdown>
  </div>
);

Message.propTypes = {
  variant: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default Message;
