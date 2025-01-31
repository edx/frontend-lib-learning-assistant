import { renderHook as rtlRenderHook } from '@testing-library/react-hooks';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved
import { CourseInfoProvider } from '../context';

import useTrackEvent from './use-track-event';

const mockedUserId = 123;
const mockedCourseId = 'some-course-id';
const mockedModuleId = 'some-module-id';
const mockedOrg = 'org';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

const mockedAuthenticatedUser = { userId: mockedUserId };
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: () => mockedAuthenticatedUser,
}));

useModel.mockImplementation(() => ({ org: mockedOrg }));

const contextWrapper = ({ courseInfo }) => function Wrapper({ children }) { // eslint-disable-line react/prop-types
  return (
    <CourseInfoProvider value={courseInfo}>
      {children}
    </CourseInfoProvider>
  );
};

const renderHook = ({
  courseInfo,
}) => rtlRenderHook(
  () => useTrackEvent(),
  { wrapper: contextWrapper({ courseInfo }) },
);

describe('useTrackEvent()', () => {
  afterEach(() => jest.resetAllMocks());

  it('should return a track method that calls sendTrackEvent with the contextual information', () => {
    const { result } = renderHook({ courseInfo: { courseId: mockedCourseId, moduleId: mockedModuleId } });

    const { track } = result.current;

    const eventLabel = 'some-cool-event-to-track';

    track(eventLabel, { some_extra_prop: 42 });

    expect(sendTrackEvent).toHaveBeenCalledWith(eventLabel, {
      course_id: mockedCourseId,
      user_id: mockedUserId,
      org_key: mockedOrg,
      module_id: mockedModuleId,
      some_extra_prop: 42,
    });
  });
});
