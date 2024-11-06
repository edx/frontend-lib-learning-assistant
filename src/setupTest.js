import '@testing-library/jest-dom';
import { mergeConfig } from '@edx/frontend-platform';

mergeConfig({
  ...process.env,
});
