import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default Badge',
  },
};

export const WithInteraction: Story = {
  args: {
    label: 'Interactive Badge',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Interactive Badge');
    await expect(badge).toBeInTheDocument();
    await userEvent.click(badge);
    await expect(badge).toHaveClass('bg-blue-100');
  },
};
