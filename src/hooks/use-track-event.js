import { useContext } from 'react';
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
  const { userId } = getAuthenticatedUser();

  const track = (event, details) => {
    sendTrackEvent(event, {
      course_id: courseId,
      user_id: userId,
      module_id: moduleId,
      ...details,
    });
  };

  return { track };
}