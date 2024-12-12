import { useContext } from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { CourseInfoContext } from '../context';

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
