import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useDecision } from '@optimizely/react-sdk';

import { OPTIMIZELY_PROMPT_EXPERIMENT_KEY } from '../data/optimizely';

// eslint-disable-next-line import/prefer-default-export
export function usePromptExperimentDecision() {
  const { userId } = getAuthenticatedUser();

  const [decision] = useDecision(
    OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
    { autoUpdate: true }, // This should make the decision reactive to changes on the experiment dashboard.
    { overrideUserId: userId.toString() }, // This override is just to make sure the userId is up to date.
  );

  return [decision];
}
