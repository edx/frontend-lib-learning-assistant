import optimizelyInstance from '../data/optimizely';

const PRODUCT_TOUR_EXP_KEY = 'la_product_tour';
const PRODUCT_TOUR_EXP_VARIATION = 'learning_assistant_product_tour';

const activateProductTourExperiment = (userId) => {
  const variant = optimizelyInstance.activate(
    PRODUCT_TOUR_EXP_KEY,
    userId,
  );
  return variant === PRODUCT_TOUR_EXP_VARIATION;
};

const trackChatBotLaunchOptimizely = (userId, userAttributes = {}) => {
  optimizelyInstance.track('learning_assistant_chat_click', userId, userAttributes);
};

const trackChatBotMessageOptimizely = (userId, userAttributes = {}) => {
  optimizelyInstance.track('learning_assistant_chat_message', userId, userAttributes);
};

export {
  activateProductTourExperiment,
  trackChatBotLaunchOptimizely,
  trackChatBotMessageOptimizely,
};
