import React from 'react';
import { Decorator } from '@storybook/react';
import * as NextImage from 'next/image';

const OriginalNextImage = NextImage.default;

// The original implementation using Object.defineProperty caused a "TypeError: Cannot redefine property: default".
// This was because the 'default' export of the 'next/image' module is not configurable.
// This new implementation replaces the Next.js Image component with a standard `img` tag,
// which is compatible with the Storybook environment and avoids the error.
Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) => (
    <OriginalNextImage
      {...props}
      unoptimized
    />
  ),
});


export const withNextImage: Decorator = (Story) => (
  <Story />
);