import { renderHook as rtlRenderHook } from '@testing-library/react-hooks';
import { useSelector } from 'react-redux';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved
import { CourseInfoProvider } from '../context';
import useCourseUpgrade from './use-course-upgrade';

jest.mock('react-redux', () => ({ useSelector: jest.fn() }));

const mockedUpgradeUrl = 'https://upgrade.edx/course/test';
const mockedAuditTrialLengthDays = 7;

const contextWrapper = ({ courseInfo }) => function Wrapper({ children }) { // eslint-disable-line react/prop-types
  return (
    <CourseInfoProvider value={courseInfo}>
      {children}
    </CourseInfoProvider>
  );
};

const renderHook = ({
  courseInfo, offer = {}, verifiedMode = {}, state = { learningAssistant: {} },
}) => {
  useModel.mockImplementation((model) => {
    switch (model) {
      case 'coursewareMeta': return { offer };
      case 'courseHomeMeta': return { verifiedMode };
      default: {
        throw new Error('Model not mocked');
      }
    }
  });

  useSelector.mockReturnValue(state.learningAssistant);

  return rtlRenderHook(
    () => useCourseUpgrade(),
    { wrapper: contextWrapper({ courseInfo }) },
  );
};

describe('useCourseUpgrade()', () => {
  beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2024-01-10 09:00:00')));
  afterAll(() => jest.useRealTimers());
  afterEach(() => jest.resetAllMocks());

  it('should return { upgradeable: false } if not eligible', () => {
    const { result } = renderHook({ courseInfo: { isUpgradeEligible: false } });

    expect(result.current).toEqual({ upgradeable: false });
  });

  it('should return { upgradeable: false } if missing upgradeUrl', () => {
    const { result } = renderHook({ courseInfo: { isUpgradeEligible: true } });

    expect(result.current).toEqual({ upgradeable: false });
  });

  it('should return { upgradeable: true } if eligible and upgradeable and no trial info for both offer and verifiedMode urls', () => {
    const expected = {
      upgradeable: true,
      auditTrial: undefined,
      auditTrialDaysRemaining: undefined,
      auditTrialExpired: false,
      auditTrialLengthDays: mockedAuditTrialLengthDays,
      upgradeUrl: mockedUpgradeUrl,
    };

    const { result: resultOffer } = renderHook({
      courseInfo: { isUpgradeEligible: true },
      offer: {
        upgradeUrl: mockedUpgradeUrl,
      },
      state: {
        learningAssistant: {
          auditTrialLengthDays: mockedAuditTrialLengthDays,
        },
      },
    });

    expect(resultOffer.current).toEqual(expected);

    const { result: resultVerified } = renderHook({
      courseInfo: { isUpgradeEligible: true },
      verifiedMode: {
        upgradeUrl: mockedUpgradeUrl,
      },
      state: {
        learningAssistant: {
          auditTrialLengthDays: mockedAuditTrialLengthDays,
        },
      },
    });

    expect(resultVerified.current).toEqual(expected);
  });

  it('should return trial info if enabled and not expired', () => {
    const { result } = renderHook({
      courseInfo: { isUpgradeEligible: true },
      offer: {
        upgradeUrl: mockedUpgradeUrl,
      },
      verifiedMode: {
        upgradeUrl: mockedUpgradeUrl,
      },
      state: {
        learningAssistant: {
          auditTrialLengthDays: mockedAuditTrialLengthDays,
          auditTrial: {
            expirationDate: '2024-01-15 09:00:00',
          },
        },
      },
    });

    expect(result.current).toEqual({
      auditTrial: {
        expirationDate: '2024-01-15 09:00:00',
      },
      auditTrialDaysRemaining: 5,
      auditTrialExpired: false,
      auditTrialLengthDays: mockedAuditTrialLengthDays,
      upgradeUrl: 'https://upgrade.edx/course/test',
      upgradeable: true,
    });
  });

  it('should return trial info if expired', () => {
    const { result } = renderHook({
      courseInfo: { isUpgradeEligible: true },
      offer: {
        upgradeUrl: mockedUpgradeUrl,
      },
      verifiedMode: {
        upgradeUrl: mockedUpgradeUrl,
      },
      state: {
        learningAssistant: {
          auditTrialLengthDays: mockedAuditTrialLengthDays,
          auditTrial: {
            expirationDate: '2024-01-05 09:00:00',
          },
        },
      },
    });

    expect(result.current).toEqual({
      auditTrial: {
        expirationDate: '2024-01-05 09:00:00',
      },
      auditTrialDaysRemaining: -5,
      auditTrialExpired: true,
      auditTrialLengthDays: mockedAuditTrialLengthDays,
      upgradeUrl: 'https://upgrade.edx/course/test',
      upgradeable: true,
    });
  });
});
