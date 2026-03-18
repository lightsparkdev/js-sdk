import type { Preview } from '@storybook/react';
import '../src/app/globals.scss';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8f8f7' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};

export default preview;
