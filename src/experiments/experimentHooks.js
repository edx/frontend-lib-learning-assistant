import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useDecision } from '@optimizely/react-sdk';

import { OPTIMIZELY_PROMPT_EXPERIMENT_KEY } from '../data/optimizely';

// eslint-disable-next-line import/prefer-default-export
export function usePromptExperimentDecision() {
  const { userId } = getAuthenticatedUser();

  const [decision] = useDecision(
    OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
    { overrideUserId: userId.toString() }, // This override is just to make sure the userId is up to date.
  );

  return [decision];
}
