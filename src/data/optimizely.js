import { createInstance } from '@optimizely/react-sdk';
import { ensureConfig, getConfig } from '@edx/frontend-platform';

ensureConfig([
  'OPTIMIZELY_FULL_STACK_SDK_KEY',
], 'Frontend Lib Learning Assistant Optimizely module');

/**
 * Initializing the Optimizely instance at the top-level will not work, because it may be initialized before
 * the OPTIMIZELY_FULL_STACK_SDK_KEY is available and will not be reinitialized afterward. Wrapping the initialization
 * in a function allows components to request the instance as-needed.
 */
let instance = null;
const getOptimizely = () => {
  const OPTIMIZELY_SDK_KEY = getConfig().OPTIMIZELY_FULL_STACK_SDK_KEY;

  if (!instance && OPTIMIZELY_SDK_KEY) {
    instance = createInstance({
      sdkKey: OPTIMIZELY_SDK_KEY,
    });
  }

  return instance;
};

const OPTIMIZELY_PROMPT_EXPERIMENT_KEY = '_cosmo__xpert_gpt_4_0_prompt';
const OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS = {
  UPDATED_PROMPT: 'updated_prompt',
};

export {
  getOptimizely,
  OPTIMIZELY_PROMPT_EXPERIMENT_KEY,
  OPTIMIZELY_PROMPT_EXPERIMENT_VARIATION_KEYS,
};
