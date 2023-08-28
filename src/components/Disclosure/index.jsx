import React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Hyperlink, Icon } from '@edx/paragon';
import { Chat } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import './Disclosure.scss';

import {
  acknowledgeDisclosure,
} from '../../data/thunks';

const Disclosure = () => {
  const dispatch = useDispatch();

  const handleAcknowledgeDisclosure = () => {
    dispatch(acknowledgeDisclosure(true));
  };

  return (
    <div className="disclosure d-flex flex-column align-items-start px-4 py-3">
      <h2 className="text-light-100">Xpert</h2>
      <h3 className="small py-2">An AI-powered educational tool</h3>
      <div className="d-flex flex-column">
        <div className="text-light-100 d-flex flex-row">
          <Icon src={Chat} className="m-2" />
          <div>
            Stuck on a concept? Need more clarification on a complicated topic?
            <br />
            Ask Xpert a question!
          </div>
        </div>
        <div className="text-light-100 font-weight-light pl-3 my-2">
          <ul>
            <li>Could you explain how to multiply two numbers?</li>
            <li>How should an essay be structured?</li>
            <li>How does photosynthesis work?</li>
          </ul>
        </div>
      </div>
      <p className="text-light-100 py-3">
        <strong>Note: </strong>
        This chat is AI generated (powered by ChatGPT). Mistakes are possible.
        By using it you agree that edX may create a record of this chat.
        Your personal data will be used as described in our&nbsp;
        <Hyperlink
          className="privacy-policy-link text-light-100"
          destination={getConfig().PRIVACY_POLICY_URL}
        >
          privacy policy
        </Hyperlink>
        .
      </p>
      <Button
        onClick={handleAcknowledgeDisclosure}
        variant="inverse-primary"
      >
        Let&apos;s get started.
      </Button>
    </div>
  );
};

Disclosure.propTypes = {};

export default Disclosure;
