import PropTypes from 'prop-types';
import { useContext } from 'react';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { OptimizelyProvider } from '@optimizely/react-sdk';
import { getLocale } from '@edx/frontend-platform/i18n';

import { getOptimizely } from '../data/optimizely';
import { CourseInfoContext } from '../context';

const ExperimentsProvider = ({ children }) => {
  const { courseId } = useContext(CourseInfoContext);
  const { userId } = getAuthenticatedUser();
  const optimizely = getOptimizely();
  const { enrollmentMode } = useModel('coursewareMeta', courseId);

  return optimizely ? (
    <OptimizelyProvider
      optimizely={optimizely}
      user={{
        id: userId.toString(),
        attributes: { lms_language_preference: getLocale(), lms_enrollment_mode: enrollmentMode },
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
