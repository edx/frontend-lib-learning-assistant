/* eslint-disable import/prefer-default-export */

export const scrollToBottom = (containerRef, smooth = false) => {
  setTimeout(() => {
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
  });
};
