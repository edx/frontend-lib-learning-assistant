import PropTypes from 'prop-types';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { OptimizelyProvider } from '@optimizely/react-sdk';

import { getLocale } from '@edx/frontend-platform/i18n';
import { getOptimizely } from '../data/optimizely';

const ExperimentsProvider = ({ children }) => {
  const { userId } = getAuthenticatedUser();
  const optimizely = getOptimizely();

  return optimizely ? (
    <OptimizelyProvider
      optimizely={optimizely}
      user={{
        id: userId.toString(),
        attributes: { lms_language_preference: getLocale() },
      }}
    >
      {children}
    </OptimizelyProvider>
  ) : (
    children
  );
};

ExperimentsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ExperimentsProvider;
