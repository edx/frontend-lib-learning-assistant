import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, Icon } from '@openedx/paragon';
import { Send } from '@openedx/paragon/icons';

import {
  acknowledgeDisclosure,
  addChatMessage,
  getChatResponse,
  updateCurrentMessage,
} from '../../data/thunks';
import { useCourseUpgrade } from '../../hooks';
import { usePromptExperimentDecision } from '../../experiments';

import './MessageForm.scss';

const MessageForm = ({ courseId, shouldAutofocus, unitId }) => {
  const { upgradeable } = useCourseUpgrade();

  const { apiIsLoading, currentMessage, apiError } = useSelector(state => state.learningAssistant);
  const dispatch = useDispatch();
  const inputRef = useRef();

  const [decision] = usePromptExperimentDecision();
  const { enabled, variationKey } = decision || {};
  const promptExperimentVariationKey = enabled ? variationKey : undefined;

  useEffect(() => {
    if (inputRef.current && !apiError && !apiIsLoading && shouldAutofocus) {
      inputRef.current.focus();
    }
  }, [apiError, apiIsLoading, shouldAutofocus]);

  const handleSubmitMessage = (event) => {
    event.preventDefault();

    if (currentMessage) {
      dispatch(acknowledgeDisclosure(true));
      dispatch(addChatMessage('user', currentMessage, courseId, promptExperimentVariationKey));
      dispatch(getChatResponse(courseId, unitId, upgradeable, promptExperimentVariationKey));
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
      data-testid="message-form-submit"
    >
      <Icon src={Send} />
    </Button>
  );

  return (
    <Form className="message-form w-100" onSubmit={handleSubmitMessage} data-testid="message-form">
      <Form.Group>
        <Form.Control
          data-hj-suppress
          disabled={apiIsLoading}
          floatingLabel="Write a message"
          onChange={handleUpdateCurrentMessage}
          trailingElement={getSubmitButton()}
          value={currentMessage}
          ref={inputRef}
          className="send-message-input"
        />
      </Form.Group>
    </Form>
  );
};

MessageForm.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  shouldAutofocus: PropTypes.bool,
};

MessageForm.defaultProps = {
  shouldAutofocus: false,
};

export default MessageForm;
