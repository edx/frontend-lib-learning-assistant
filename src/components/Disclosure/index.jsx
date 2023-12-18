import PropTypes from 'prop-types';
import React from 'react';

import { Hyperlink, Icon } from '@edx/paragon';
import { Chat } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import MessageForm from '../MessageForm';
import './Disclosure.scss';

const Disclosure = ({ courseId, unitId }) => (
  <div className="disclosure d-flex flex-column align-items-stretch px-4 py-3">
    <h2 className="text-light-100">
      Xpert
      <sub className="version-subscript">beta</sub>
    </h2>
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
    <p className="disclaimer text-light-100 py-3">
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
    <MessageForm courseId={courseId} unitId={unitId} />
  </div>
);

Disclosure.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
};

export default Disclosure;
