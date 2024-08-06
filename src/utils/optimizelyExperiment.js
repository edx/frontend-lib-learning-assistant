import { getOptimizely } from '../data/optimizely';

const trackChatBotMessageOptimizely = (userId, userAttributes = {}) => {
  const optimizelyInstance = getOptimizely();

  if (!optimizelyInstance) { return; }

  optimizelyInstance.onReady().then(() => {
    optimizelyInstance.track('learning_assistant_chat_message', userId, userAttributes);
  });
};

export default trackChatBotMessageOptimizely;
