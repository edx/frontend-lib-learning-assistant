import { renderHook as rtlRenderHook } from '@testing-library/react-hooks';
import { useSelector } from 'react-redux';
import { useModel } from '@src/generic/model-store'; // eslint-disable-line import/no-unresolved
import { CourseInfoProvider } from '../context';
import useCourseUpgrade from './use-course-upgrade';
import { OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS } from '../data/optimizely';

import { useAuditTrialExperimentDecision } from '../experiments';

jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('../experiments', () => ({ useAuditTrialExperimentDecision: jest.fn() }));

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
  courseInfo, coursewareMeta = { offer: {} }, courseHomeMeta = { verifiedMode: {} }, state = { learningAssistant: {} },
}) => {
  useModel.mockImplementation((model) => {
    switch (model) {
      case 'coursewareMeta': return coursewareMeta;
      case 'courseHomeMeta': return courseHomeMeta;
      default: {
        throw new Error('Model not mocked');
      }
    }
  });

  useSelector.mockReturnValue(state.learningAssistant);
  useAuditTrialExperimentDecision.mockReturnValue([{
    enabled: true,
    variationKey: OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS.XPERT_AUDIT_14_DAY_TRIAL,
  }]);

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

  it('should return { upgradeable: false } if audit trial experiment is not enabled', () => {
    const { result } = renderHook({ courseInfo: { isUpgradeEligible: true } });
    useAuditTrialExperimentDecision.mockReturnValue([{
      enabled: false,
      variationKey: OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS.XPERT_AUDIT_14_DAY_TRIAL,
    }]);

    expect(result.current).toEqual({ upgradeable: false });
  });

  it('should return { upgradeable: false } is not one of the audit trial experiment treatment keys', () => {
    useAuditTrialExperimentDecision.mockReturnValue([{
      enabled: false,
      variationKey: OPTIMIZELY_AUDIT_TRIAL_LENGTH_EXPERIMENT_VARIATION_KEYS.CONTROL,
    }]);
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
      isFBE: false,
    };

    const { result: resultOffer } = renderHook({
      courseInfo: { isUpgradeEligible: true },
      coursewareMeta: {
        offer: {
          upgradeUrl: mockedUpgradeUrl,
        },
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
      courseHomeMeta: {
        verifiedMode: {
          upgradeUrl: mockedUpgradeUrl,
        },
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
      coursewareMeta: {
        offer: {
          upgradeUrl: mockedUpgradeUrl,
        },
      },
      courseHomeMeta: {
        verifiedMode: {
          upgradeUrl: mockedUpgradeUrl,
        },
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
      isFBE: false,
    });
  });

  it.each([
    ['2024-01-05 09:00:00', -5],
    ['2024-01-10 08:00:00', -0],
    ['2024-01-10 09:00:00', 0],
  ])('should return trial info if expired', (expirationDate, expectedAuditTrialDaysRemaining) => {
    const { result } = renderHook({
      courseInfo: { isUpgradeEligible: true },
      coursewareMeta: {
        offer: {
          upgradeUrl: mockedUpgradeUrl,
        },
      },
      courseHomeMeta: {
        verifiedMode: {
          upgradeUrl: mockedUpgradeUrl,
        },
      },
      state: {
        learningAssistant: {
          auditTrialLengthDays: mockedAuditTrialLengthDays,
          auditTrial: {
            expirationDate,
          },
        },
      },
    });

    expect(result.current).toEqual({
      auditTrial: {
        expirationDate,
      },
      auditTrialDaysRemaining: expectedAuditTrialDaysRemaining,
      auditTrialExpired: true,
      auditTrialLengthDays: mockedAuditTrialLengthDays,
      upgradeUrl: 'https://upgrade.edx/course/test',
      upgradeable: true,
      isFBE: false,
    });
  });

  it('should return isFBE true if feature based enrollment', () => {
    const { result } = renderHook({
      courseInfo: { isUpgradeEligible: true },
      coursewareMeta: {
        offer: {
          upgradeUrl: mockedUpgradeUrl,
        },
        accessExpiration: {
          upgradeDeadline: '2024-01-07 09:00:00',
        },
        datesBannerInfo: {
          contentTypeGatingEnabled: true,
        },
      },
      courseHomeMeta: {
        verifiedMode: {
          upgradeUrl: mockedUpgradeUrl,
        },
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
      isFBE: true,
    });
  });
});
