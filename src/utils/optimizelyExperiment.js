import { getOptimizely } from '../data/optimizely';

const trackChatBotMessageOptimizely = (userId, userAttributes = {}) => {
  const optimizelyInstance = getOptimizely();
  optimizelyInstance.track('learning_assistant_chat_message', userId, userAttributes);
};

export default trackChatBotMessageOptimizely;
