/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

const useDecision = (experimentKey) => (
  // To mock optimizely for local smoke testing, set the value of "enabled" to "true" and
  // replace "replace_me" with the desired value from OPTIMIZELY_VTR_EXPERIMENT_VARIATION_KEYS
  // which can be found in src/data/optimizely.js
  [{ enabled: true, variationKey: 'replace_me' }]
);

const OptimizelyProvider = ({ optimizely, user, children = null }) => children;

const createInstance = (args) => ({});

export {
  createInstance,
  useDecision,
  OptimizelyProvider,
};
