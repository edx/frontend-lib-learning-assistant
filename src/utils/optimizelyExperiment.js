import { getOptimizely } from '../data/optimizely';

const trackChatBotMessageOptimizely = (userId, userAttributes = {}) => {
  const optimizelyInstance = getOptimizely();

  if (!optimizelyInstance || Object.keys(optimizelyInstance).length === 0) { return; }

  optimizelyInstance.onReady().then(() => {
    optimizelyInstance.track('learning_assistant_chat_message', userId, userAttributes);
  });
};

const trackUpgradeButtonClickedOptimizely = (userId, userAttributes = {}) => {
  const optimizelyInstance = getOptimizely();

  if (!optimizelyInstance || Object.keys(optimizelyInstance).length === 0) { return; }

  optimizelyInstance.onReady().then(() => {
    optimizelyInstance.track('upgrade_button_click', userId, userAttributes);
  });
};

export {
  trackChatBotMessageOptimizely,
  trackUpgradeButtonClickedOptimizely,
};
