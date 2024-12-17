import React from 'react';
import { Check } from '@openedx/paragon/icons';
import { Icon, Stack } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

const CheckmarkBullet = () => (
  <Icon src={Check} className="xpert-value-prop-check" />
);

export const VerifiedCertBullet = () => {
  const verifiedCertLink = (
    <a className="inline-link-underline font-weight-bold text-white" rel="noopener noreferrer" target="_blank" href={`${getConfig().MARKETING_SITE_BASE_URL}/verified-certificate`}>
      <FormattedMessage
        id="advertisements.upsell.verifiedCertBullet.verifiedCert"
        defaultMessage="verified certificate"
        description="Bolded words 'verified certificate', which is the name of credential the learner receives."
      />
    </a>
  );
  return (
    <Stack direction="horizontal" gap={3} role="listitem" className="align-items-start xpert-value-prop" data-testid="verified-cert-bullet">
      <CheckmarkBullet />
      <span>
        <FormattedMessage
          id="advertisements.upsell.verifiedCertBullet"
          defaultMessage="Earn a {verifiedCertLink} of completion to showcase on your resumé"
          description="Bullet showcasing benefit of earned credential."
          values={{ verifiedCertLink }}
        />
      </span>
    </Stack>
  );
};

export const UnlockGradedBullet = () => {
  const gradedAssignmentsInBoldText = (
    <span className="font-weight-bold">
      <FormattedMessage
        id="advertisements.upsell.unlockGradedBullet.gradedAssignments"
        defaultMessage="graded assignments"
        description="Bolded words 'graded assignments', which are the bolded portion of a bullet point highlighting that course content is unlocked when purchasing an upgrade. Graded assignments are any course content that is graded and are unlocked by upgrading to verified certificates."
      />
    </span>
  );
  return (
    <Stack direction="horizontal" gap={3} role="listitem" className="align-items-start xpert-value-prop" data-testid="unlock-graded-bullet">
      <CheckmarkBullet />
      <span>
        <FormattedMessage
          id="advertisements.upsell.unlockGradedBullet"
          defaultMessage="Unlock your access to all course activities, including {gradedAssignmentsInBoldText}"
          description="Bullet showcasing benefit of additional course material."
          values={{ gradedAssignmentsInBoldText }}
        />
      </span>
    </Stack>
  );
};

export const FullAccessBullet = () => {
  const fullAccessInBoldText = (
    <span className="font-weight-bold">
      <FormattedMessage
        id="advertisements.upsell.fullAccessBullet.fullAccess"
        defaultMessage="Full access"
        description="Bolded phrase 'Full access', which is the bolded portion of a bullet point highlighting that access to course content will not have time limits."
      />
    </span>
  );
  return (
    <Stack direction="horizontal" gap={3} role="listitem" className="align-items-start xpert-value-prop" data-testid="full-access-bullet">
      <CheckmarkBullet />
      <span>
        <FormattedMessage
          id="advertisements.upsell.fullAccessBullet"
          defaultMessage="{fullAccessInBoldText} to course content and materials, even after the course ends"
          description="Bullet showcasing upgrade lifts access durations."
          values={{ fullAccessInBoldText }}
        />
      </span>
    </Stack>
  );
};

export const XpertAccessBullet = () => {
  const xpertLearningAssistantInBoldText = (
    <span className="font-weight-bold">
      <FormattedMessage
        id="advertisements.upsell.xpertAccessBullet.xpertLearningAssistant"
        defaultMessage="Xpert Learning Assistant"
        description="Bolded phrase 'Xpert Learning Assistant', which is the bolded portion of a bullet point highlighting that access to the Xpert Learning Assistant after purchasing an upgrade."
      />
    </span>
  );
  return (
    <Stack direction="horizontal" gap={3} role="listitem" className="align-items-start xpert-value-prop" data-testid="xpert-access-bullet">
      <CheckmarkBullet />
      <span>
        <FormattedMessage
          id="advertisements.upsell.xpertAccessBullet"
          defaultMessage="Gain full access to {xpertLearningAssistantInBoldText}"
          description="Bullet showcasing benefit of Xpert Learning Assistant."
          values={{ xpertLearningAssistantInBoldText }}
        />
      </span>
    </Stack>
  );
};
