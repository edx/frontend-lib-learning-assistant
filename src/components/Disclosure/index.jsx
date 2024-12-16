import PropTypes from 'prop-types';
import React from 'react';

import { Hyperlink, Icon, Button } from '@openedx/paragon';
import { QuestionAnswerOutline, LightbulbCircle, AutoAwesome } from '@openedx/paragon/icons';
import { ensureConfig, getConfig } from '@edx/frontend-platform/config';
import { useCourseUpgrade, useTrackEvent } from '../../hooks';

import './Disclosure.scss';

ensureConfig(['PRIVACY_POLICY_URL']);

const Disclosure = ({ children }) => {
  const { upgradeable, upgradeUrl, auditTrialLengthDays } = useCourseUpgrade();
  const { track } = useTrackEvent();

  const handleClick = () => track('edx.ui.lms.learning_assistant.disclosure_upgrade_click');
  const freeDays = auditTrialLengthDays === 1 ? '1 day' : `${auditTrialLengthDays} days`;

  return (
    <section className="disclosure d-flex flex-column align-items-stretch">
      <h2 className="text-light-100">
        Xpert Learning Assistant
      </h2>
      <div className="info">
        <h3 className="small py-2">An AI-powered educational tool</h3>
        <div className="d-flex flex-column">
          <div className="text-light-100 d-flex flex-row mb-3">
            <Icon src={LightbulbCircle} className="bullet-icon" />
            <div>
              Understand a concept<br />
              <small>“How does photosynthesis work?”</small>
            </div>
          </div>
          <div className="text-light-100 d-flex flex-row mb-4">
            <Icon src={QuestionAnswerOutline} className="bullet-icon" />
            <div>
              Summarize your learning<br />
              <small>“Can you help me review pivot tables?”</small>
            </div>
          </div>
        </div>
        {upgradeable ? (
          <div className="trial-period">
            <div className="trial-period-content">
              <div className="d-flex flex-row text-light-100">
                <Icon src={AutoAwesome} className="bullet-icon bullet-icon" />
                <small data-testid="free-days-label">
                  Free for {freeDays}, then upgrade course for full access to Xpert features.
                </small>
              </div>
              <Button
                onClick={handleClick}
                href={upgradeUrl}
                className="trial-upgrade mt-3"
                block
                data-testid="upgrade-cta"
              >
                Upgrade now
              </Button>
            </div>
          </div>
        ) : null}
        <p className="disclaimer small text-light-100 py-3">
          Note: This chat is AI generated, mistakes are possible.
          By using it you agree that edX may create a record of this chat.
          Your personal data will be used as described in our &nbsp;
          <Hyperlink
            className="privacy-policy-link text-light-100"
            destination={getConfig().PRIVACY_POLICY_URL}
          >
            privacy policy
          </Hyperlink>
          .
        </p>
      </div>
      <footer>
        {children}
      </footer>
    </section>
  );
};

Disclosure.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Disclosure;
