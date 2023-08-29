import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send } from 'react-feather';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { Button, Icon, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import Disclosure from '../Disclosure';
import ChatBox from '../ChatBox';
import APIError from '../APIError';
import './Sidebar.scss';
import {
  addChatMessage,
  clearMessages,
  getChatResponse,
  updateCurrentMessage,
} from '../../data/thunks';
import { ReactComponent as NewXeySvg } from '../../assets/new_xey.svg';

const Sidebar = ({
  courseId,
  isOpen,
  setIsOpen,
}) => {
  const {
    apiError,
    apiIsLoading,
    currentMessage,
    disclosureAcknowledged,
    messageList,
  } = useSelector(state => state.learningAssistant);
  const chatboxContainerRef = useRef(null);
  const dispatch = useDispatch();

  // this use effect is intended to scroll to the bottom of the chat window, in the case
  // that a message is larger than the chat window height.
  useEffect(() => {
    const messageContainer = chatboxContainerRef.current;

    if (messageContainer) {
      const { scrollHeight, clientHeight } = messageContainer;
      const maxScrollTop = scrollHeight - clientHeight;
      const duration = 200;

      if (maxScrollTop > 0) {
        const startTime = Date.now();
        const endTime = startTime + duration;

        const scroll = () => {
          const currentTime = Date.now();
          const timeFraction = (currentTime - startTime) / duration;
          const scrollTop = maxScrollTop * timeFraction;

          messageContainer.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
          });

          if (currentTime < endTime) {
            requestAnimationFrame(scroll);
          }
        };

        requestAnimationFrame(scroll);
      }
    }
  }, [messageList, isOpen, apiError]);

  const handleClick = () => {
    setIsOpen(false);

    // check to see if hotjar is available, then trigger hotjar event
    const hasWindow = typeof window !== 'undefined';
    if (hasWindow && window.hj) {
      window.hj('event', 'ocm_learning_assistant_chat_closed');
    }
  };

  const handleUpdateCurrentMessage = (event) => {
    dispatch(updateCurrentMessage(event.target.value));
  };

  const handleSubmitMessage = (event) => {
    event.preventDefault();
    if (currentMessage) {
      dispatch(addChatMessage('user', currentMessage, courseId));
      dispatch(getChatResponse(courseId));
    }
  };

  const handleClearMessages = () => {
    dispatch(clearMessages());
    sendTrackEvent('edx.ui.lms.learning_assistant.clear', {
      course_id: courseId,
    });
  };

  const getSidebar = () => (
    <div className="h-100 d-flex flex-column justify-content-stretch">
      <div className="d-flex flex-column align-items-center p-3">
        <h1 className="font-weight-bold mb-3 d-inline-flex flex-row">
          Hi, I&apos;m Xpert!
          <NewXeySvg width="20" className="pl-1" />
        </h1>
        <p className="px-3 mb-0 text-center">
          Stuck on a concept? Need more clarification on a complicated topic?
          Let&apos;s chat!
        </p>
      </div>
      <span className="separator" />
      <ChatBox
        chatboxContainerRef={chatboxContainerRef}
        messageList={messageList}
      />
      {
        apiError
        && (
          <div className="d-flex flex-column p-3 mt-auto">
            <APIError />
          </div>
        )
      }
      <form className={`d-flex flex-row p-2 ${apiError ? 'mt-1' : 'mt-auto'}`} onSubmit={handleSubmitMessage}>
        <input
          type="text"
          value={currentMessage}
          onChange={handleUpdateCurrentMessage}
          placeholder="Type your question..."
          className="w-100 p-3"
          data-hj-suppress
        />
        <Button
          className="mt-2 mb-1 mx-1 border-0"
          type="submit"
          data-testid="submit-button"
          variant="inverse-primary"
          disabled={apiIsLoading}
          aria-label="submit"
        >
          <Send size="22" />
        </Button>
      </form>
      <div className="d-flex justify-content-start">
        <Button
          className="clear mx-2 mb-2 border-0"
          onClick={handleClearMessages}
          aria-label="clear"
          variant="primary"
          type="button"
        >
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    isOpen && (
      <div
        className="sidebar position-fixed"
      >
        <IconButton
          className="chat-close position-absolute m-2 border-0"
          src={Close}
          iconAs={Icon}
          data-testid="close-button"
          onClick={handleClick}
          aria-label="close"
          variant="primary"
          invertColors={!disclosureAcknowledged}
        />
        {disclosureAcknowledged ? (getSidebar()) : (<Disclosure />)}
      </div>
    )
  );
};

Sidebar.propTypes = {
  courseId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default Sidebar;
