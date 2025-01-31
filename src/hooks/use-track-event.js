import { useContext } from 'react';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { CourseInfoContext } from '../context';

/**
 * @typedef Tracker
 * @type {object}
 * @property {(eventName: string, details?: object)} track Calls sendTrackEvent with user and course context.
 */

/**
 * This hook returns a track method to track events.
 *
 * @returns {Tracker}
 */
export default function useTrackEvent() {
  const { courseId, moduleId } = useContext(CourseInfoContext);
  const { org } = useModel('courseHomeMeta', courseId);
  const { userId } = getAuthenticatedUser();

  const track = (event, details) => {
    sendTrackEvent(event, {
      course_id: courseId,
      org_key: org,
      user_id: userId,
      module_id: moduleId,
      ...details,
    });
  };

  return { track };
}
