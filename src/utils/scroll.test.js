import { scrollToBottom } from './scroll';

describe('scrollToBottom()', () => {
  beforeAll(() => jest.useFakeTimers());

  it('should scroll to the scrollHeight of the referred component instantly', () => {
    const ref = {
      current: {
        scrollTo: jest.fn(),
        scrollHeight: 42,
      },
    };
    scrollToBottom(ref);
    jest.runAllTimers();

    expect(ref.current.scrollTo).toHaveBeenCalledWith({
      top: ref.current.scrollHeight,
      behavior: 'instant',
    });
  });

  it('should scroll to the scrollHeight of the referred component smoothly', () => {
    const ref = {
      current: {
        scrollTo: jest.fn(),
        scrollHeight: 128,
      },
    };
    scrollToBottom(ref, true);
    jest.runAllTimers();

    expect(ref.current.scrollTo).toHaveBeenCalledWith({
      top: ref.current.scrollHeight,
      behavior: 'smooth',
    });
  });
});
