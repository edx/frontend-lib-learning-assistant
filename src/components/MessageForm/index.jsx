import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Form, Icon } from '@edx/paragon';
import { Send } from '@edx/paragon/icons';

import {
  acknowledgeDisclosure,
  addChatMessage,
  getChatResponse,
  updateCurrentMessage,
} from '../../data/thunks';

const MessageForm = ({ courseId }) => {
  const { apiIsLoading, currentMessage } = useSelector(state => state.learningAssistant);
  const dispatch = useDispatch();

  const handleSubmitMessage = (event) => {
    event.preventDefault();
    if (currentMessage) {
      dispatch(acknowledgeDisclosure(true));
      dispatch(addChatMessage('user', currentMessage, courseId));
      dispatch(getChatResponse(courseId));
    }
  };

  const handleUpdateCurrentMessage = (event) => {
    dispatch(updateCurrentMessage(event.target.value));
  };

  const getSubmitButton = () => (
    <Button
      aria-label="submit"
      disabled={apiIsLoading}
      onClick={handleSubmitMessage}
      size="inline"
      variant="tertiary"
    >
      <Icon src={Send} />
    </Button>
  );

  return (
    <Form className="w-100 pl-2" onSubmit={handleSubmitMessage}>
      <Form.Group>
        <Form.Control
          data-hj-suppress
          disabled={apiIsLoading}
          floatingLabel="Write a message"
          onChange={handleUpdateCurrentMessage}
          trailingElement={getSubmitButton()}
          value={currentMessage}
        />
      </Form.Group>
    </Form>
  );
};

MessageForm.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default MessageForm;
