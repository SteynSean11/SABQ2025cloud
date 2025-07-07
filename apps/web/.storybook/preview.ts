import type { Preview } from "@storybook/nextjs-vite";
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { withNextImage } from './decorators';
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: INITIAL_VIEWPORTS,
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [withNextImage],
};

export default preview;
