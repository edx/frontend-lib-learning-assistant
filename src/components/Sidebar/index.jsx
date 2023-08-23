import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send } from 'react-feather';
import PropTypes from 'prop-types';
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
  const { messageList, currentMessage, apiError } = useSelector(state => state.learningAssistant);
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
      dispatch(addChatMessage('user', currentMessage));
      dispatch(getChatResponse(courseId));
    }
  };

  const handleClearMessages = () => {
    dispatch(clearMessages());
  };

  return (
    isOpen && (
      <div
        className={
          `sidebar d-flex flex-column justify-content-between position-fixed border-left 100-vh
          ${isOpen ? 'open' : ''}`
        }
      >
        <button
          className="close position-absolute m-3 p-0 border-0"
          data-testid="close-button"
          onClick={handleClick}
          type="button"
        >
          <svg
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 8.586L4.707 3.293a1 1 0 00-1.414 1.414L8.586 10l-5.293 5.293a1 1 0 101.414 1.414L10 11.414l5.293 5.293a1 1 0 001.414-1.414L11.414 10l5.293-5.293a1 1 0 00-1.414-1.414L10 8.586z" />
          </svg>
        </button>
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
          <button
            className="mt-2 mb-1 mx-2 border-0"
            type="submit"
            data-testid="submit-button"
          >
            <Send size="22" className="ml-1" />
          </button>
        </form>
        <div className="d-flex justify-content-start">
          <button
            className="clear mx-2 mb-2 border-0"
            onClick={handleClearMessages}
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
    ));
};

Sidebar.propTypes = {
  courseId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default Sidebar;
