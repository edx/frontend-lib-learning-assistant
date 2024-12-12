import { createContext } from 'react';

export const CourseInfoContext = createContext('course-info', {
  courseId: null,
  unitId: null,
  isUpgradeEligible: false,
});

export const CourseInfoProvider = CourseInfoContext.Provider;
