import type { Meta, StoryObj } from '@storybook/react';

import { ImageUploader } from './image-uploader';

const meta: Meta<typeof ImageUploader> = {
  title: 'Components/ImageUploader',
  component: ImageUploader,
  parameters: {
    layout: 'centered',
  },
  args: {
    // Default args for all stories
  },
};

export default meta;

type Story = StoryObj<typeof ImageUploader>;

export const Default: Story = {
  args: {
    // Default props for the ImageUploader
  },
};

export const WithInitialImage: Story = {
  args: {
    initialImages: [
      {
        key: '1',
        name: 'sample.jpg',
        url: 'https://apadana.app/images/sample.jpg',
      },
    ],
  },
};

export const Disabled: Story = {
  args: {
    // disabled: true,
  },
};

export const DarkMode: Story = {
  args: {
    // Props to showcase dark mode handling
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
