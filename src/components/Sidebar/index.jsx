import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send } from 'react-feather';
import PropTypes from 'prop-types';
import ChatBox from '../ChatBox';
import './Sidebar.css';
import {
  addChatMessage,
  clearMessages,
  updateCurrentMessage,
} from '../../data/thunks';
import { ReactComponent as NewXeySvg } from '../../assets/new_xey.svg';

const Sidebar = ({
  isOpen,
  setIsOpen,
}) => {
  const { messageList, currentMessage } = useSelector(state => state.learningAssistant);
  const chatboxContainerRef = useRef(null);
  const dispatch = useDispatch();

  // this use effect is intended to scroll to the bottom of the chat window, in the case
  // that a message is larger than the chat window height.
  useEffect(() => {
    const messageContainer = chatboxContainerRef.current;
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
  }, [messageList]);

  const handleClick = () => {
    setIsOpen(false);
  };

  const handleUpdateCurrentMessage = (event) => {
    dispatch(updateCurrentMessage(event.target.value));
  };

  const handleSubmitMessage = (event) => {
    event.preventDefault();
    if (currentMessage) {
      dispatch(addChatMessage('user', currentMessage));
    }
  };

  const handleClearMessages = () => {
    dispatch(clearMessages());
  };

  return (
    <div
      className={`sidebar flex flex-col justify-between fixed top-0 ${
        isOpen ? 'open-sidebar' : 'closed-sidebar'
      } h-screen bg-gray-50 border-gray-400 border-l transition-all ease duration-800`}
    >
      <div className="flex flex-col">
        <button
          className="absolute top-0 right-0 m-4 text-gray-500 hover:text-gray-600"
          onClick={handleClick}
          type="button"
        >
          <svg
            className="w-6 h-6 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 8.586L4.707 3.293a1 1 0 00-1.414 1.414L8.586 10l-5.293 5.293a1 1 0 101.414 1.414L10 11.414l5.293 5.293a1 1 0 001.414-1.414L11.414 10l5.293-5.293a1 1 0 00-1.414-1.414L10 8.586z" />
          </svg>
        </button>
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4 inline-flex">
            Hi, I&apos;m Xpert! <NewXeySvg width="20" className="pl-1" />
          </h1>
          <p className="px-4">
            Stuck on a concept? Need more clarification on a complicated topic?
            Let&apos;s chat!
          </p>
        </div>
      </div>
      <span className="separator" />
      <ChatBox
        chatboxContainerRef={chatboxContainerRef}
        messageList={messageList}
      />
      <form className="flex p-2 mt-auto" onSubmit={handleSubmitMessage}>
        <input
          type="text"
          value={currentMessage}
          onChange={handleUpdateCurrentMessage}
          placeholder="Type your question..."
          className="w-full border border-gray-300 rounded-md p-4 focus:outline-none focus:border-blue-500"
        />
        <button className="text-blue-900 mt-2 mb-1 mx-2" type="submit">
          <Send size="22" className="ml-1" />
        </button>
      </form>
      <div className="flex justify-start">
        <button
          className="rounded-full bg-blue-100 text-blue-900 px-3 mx-2 mb-2"
          onClick={handleClearMessages}
          type="button"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default Sidebar;
