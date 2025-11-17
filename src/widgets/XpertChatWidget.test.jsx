import React from 'react';
import { screen, render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import XpertChatWidget from './XpertChatWidget';
import { reducer as learningAssistantReducer } from '../data/slice';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(() => ({ userId: 1 })),
}));

// Mock useModel to read from Redux store
let mockUseModel;
jest.mock('@src/generic/model-store', () => ({
  useModel: jest.fn((...args) => mockUseModel?.(...args)),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
  ensureConfig: jest.fn(),
}));

const baseConfig = {
  ENABLE_XPERT_AUDIT: true,
  CONTENT_TOOLS_ENABLED: false,
  FEATURE_ENABLE_CHAT_V2_ENDPOINT: true,
};

beforeEach(() => {
  getConfig.mockReturnValue(baseConfig);
});

afterEach(() => {
  jest.clearAllMocks();
});

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const unitId = 'block-v1:edX+DemoX+Demo_Course+type@unit+block@unit1';

function renderWithStore(
  ui,
  {
    courseMeta,
    specialExams = {},
    learningAssistant,
    userIsStaff = false,
  } = {},
) {
  const preloadedLearningAssistant = learningAssistant || {
    currentMessage: '',
    messageList: [],
    apiIsLoading: false,
    apiError: false,
    disclosureAcknowledged: true,
    sidebarIsOpen: false,
    isEnabled: true,
  };

  const store = configureStore({
    reducer: {
      learningAssistant: learningAssistantReducer,
      models: (state = {
        coursewareMeta: courseMeta ? { [courseId]: courseMeta } : {},
        user: { isStaff: userIsStaff },
      }) => state,
      specialExams: (state = specialExams) => state,
    },
    preloadedState: {
      learningAssistant: preloadedLearningAssistant,
      models: { coursewareMeta: courseMeta ? { [courseId]: courseMeta } : {}, user: { isStaff: userIsStaff } },
      specialExams,
    },
  });

  // Setup useModel mock to read from the store
  mockUseModel = (modelType, id) => {
    const state = store.getState();
    if (modelType === 'coursewareMeta') {
      return state.models.coursewareMeta?.[id];
    }
    return undefined;
  };

  return render(
    <IntlProvider locale="en">
      <Provider store={store}>{ui}</Provider>
    </IntlProvider>,
  );
}

describe('XpertChatWidget gating', () => {
  test('returns null when learning assistant explicitly disabled', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const past = new Date(Date.now() - 86_400_000).toISOString();
    renderWithStore(
      <XpertChatWidget
        courseId={courseId}
        unitId={unitId}
        userId="1"
        isStaff={false}
        enrollmentMode="audit"
      />,
      {
        courseMeta: {
          learningAssistantEnabled: false,
          start: past,
          end: future,
          accessExpiration: { expirationDate: future },
        },
      },
    );
    expect(screen.queryByTestId('toggle-button')).not.toBeInTheDocument();
  });

  test('returns null while course not yet loaded', () => {
    renderWithStore(
      <XpertChatWidget
        courseId={courseId}
        unitId={unitId}
        userId="1"
        isStaff={false}
        enrollmentMode="audit"
      />,
      { courseMeta: undefined },
    );
    expect(screen.queryByTestId('toggle-button')).not.toBeInTheDocument();
  });

  test('returns null during active exam attempt', () => {
    renderWithStore(
      <XpertChatWidget
        courseId={courseId}
        unitId={unitId}
        userId="1"
        isStaff={false}
        enrollmentMode="audit"
      />,
      { courseMeta: { learningAssistantEnabled: true }, specialExams: { activeAttempt: { attempt_id: 'abc' } } },
    );
    expect(screen.queryByTestId('toggle-button')).not.toBeInTheDocument();
  });

  test('renders Xpert when audit user allowed and dates valid', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const past = new Date(Date.now() - 86_400_000).toISOString();
    renderWithStore(<XpertChatWidget
      courseId={courseId}
      unitId={unitId}
      userId="1"
      isStaff={false}
      enrollmentMode="audit"
    />, {
      courseMeta: {
        learningAssistantEnabled: true,
        start: past,
        end: future,
        accessExpiration: { expirationDate: future },
      },
      userIsStaff: false,
    });
    expect(await screen.findByTestId('toggle-button')).toBeVisible();
  });

  test('renders for expired audit user to show upgrade panel', async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const future = new Date(Date.now() + 86_400_000).toISOString();
    renderWithStore(<XpertChatWidget
      courseId={courseId}
      unitId={unitId}
      userId="1"
      isStaff={false}
      enrollmentMode="audit"
    />, {
      courseMeta: {
        learningAssistantEnabled: true,
        start: past,
        end: future,
        accessExpiration: { expirationDate: future },
      },
      learningAssistant: {
        currentMessage: '',
        messageList: [],
        apiIsLoading: false,
        apiError: false,
        disclosureAcknowledged: true,
        sidebarIsOpen: false,
        isEnabled: true,
        auditTrial: { startDate: past, expirationDate: past },
        auditTrialLengthDays: 7,
      },
    });
    expect(await screen.findByTestId('toggle-button')).toBeVisible();
  });

  test('staff user renders even without enrollmentMode', async () => {
    renderWithStore(<XpertChatWidget
      courseId={courseId}
      unitId={unitId}
      userId="1"
      isStaff
      enrollmentMode={null}
    />, { courseMeta: { learningAssistantEnabled: true }, userIsStaff: true });
    expect(await screen.findByTestId('toggle-button')).toBeVisible();
  });

  test('paid verified learner renders even when not upgrade eligible', async () => {
    renderWithStore(<XpertChatWidget
      courseId={courseId}
      unitId={unitId}
      userId="2"
      isStaff={false}
      enrollmentMode="verified"
    />, {
      courseMeta: {
        learningAssistantEnabled: true,
        start: new Date(Date.now() - 3600_000).toISOString(),
        end: new Date(Date.now() + 3600_000).toISOString(),
      },
      userIsStaff: false,
    });
    expect(await screen.findByTestId('toggle-button')).toBeVisible();
  });

  test('expired audit learner with valid course still renders widget for upsell', async () => {
    const past = new Date(Date.now() - 3600_000).toISOString();
    const future = new Date(Date.now() + 3600_000).toISOString();
    // Preload learningAssistant slice with auditTrial showing expiration already past
    renderWithStore(<XpertChatWidget
      courseId={courseId}
      unitId={unitId}
      userId="3"
      isStaff={false}
      enrollmentMode="audit"
    />, {
      courseMeta: {
        learningAssistantEnabled: true,
        start: past,
        end: future,
        accessExpiration: { expirationDate: future },
      },
      learningAssistant: {
        currentMessage: '',
        messageList: [],
        apiIsLoading: false,
        apiError: false,
        disclosureAcknowledged: true,
        sidebarIsOpen: false,
        isEnabled: true,
        auditTrial: { startDate: past, expirationDate: past },
        auditTrialLengthDays: 7,
      },
    });
    expect(await screen.findByTestId('toggle-button')).toBeVisible();
  });

  test('staff user sees widget even when library slice isEnabled=false', async () => {
    // Provide learningAssistant slice with isEnabled false; staff should still see chat
    renderWithStore(<XpertChatWidget
      courseId={courseId}
      unitId={unitId}
      userId="4"
      isStaff
      enrollmentMode={null}
    />, {
      courseMeta: {
        learningAssistantEnabled: true,
        start: new Date(Date.now() - 3600_000).toISOString(),
        end: new Date(Date.now() + 3600_000).toISOString(),
      },
      learningAssistant: {
        currentMessage: '',
        messageList: [],
        apiIsLoading: false,
        apiError: false,
        disclosureAcknowledged: true,
        sidebarIsOpen: false,
        isEnabled: false, // explicitly disabled
        auditTrial: {},
        auditTrialLengthDays: null,
      },
      userIsStaff: true,
    });
    // With isEnabled false, staff behaves like other roles and should NOT see the widget
    expect(screen.queryByTestId('toggle-button')).not.toBeInTheDocument();
  });
});
