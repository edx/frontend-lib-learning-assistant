import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useDecision } from '@optimizely/react-sdk';

import { OPTIMIZELY_PROMPT_EXPERIMENT_KEY } from '../data/optimizely';

// eslint-disable-next-line import/prefer-default-export
export function usePromptExperimentDecision() {
  const { userId } = getAuthenticatedUser();

  const [decision] = useDecision(
    OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
    { autoUpdate: true },
    { overrideUserId: userId.toString() },
  );

  return [decision];
}
