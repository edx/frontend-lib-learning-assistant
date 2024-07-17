import { getOptimizely } from '../data/optimizely';

const trackChatBotLaunchOptimizely = (userId, userAttributes = {}) => {
  const optimizelyInstance = getOptimizely();
  optimizelyInstance.track('learning_assistant_chat_click', userId, userAttributes);
};

const trackChatBotMessageOptimizely = (userId, userAttributes = {}) => {
  const optimizelyInstance = getOptimizely();
  optimizelyInstance.track('learning_assistant_chat_message', userId, userAttributes);
};

export {
  trackChatBotLaunchOptimizely,
  trackChatBotMessageOptimizely,
};
