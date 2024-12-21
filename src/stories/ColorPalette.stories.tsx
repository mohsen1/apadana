// story for colors

import { Meta, StoryObj } from '@storybook/react';

interface ColorCardProps {
  name: string;
  bgClass: string;
  textClass: string;
  isBorder?: boolean;
}

function ColorCard({ name, bgClass, textClass, isBorder = false }: ColorCardProps) {
  if (isBorder) {
    return (
      <div className='overflow-hidden rounded-lg border'>
        <div className='bg-background p-4'>
          <h3 className='text-lg font-semibold'>{name}</h3>
          <div className={`h-8 ${bgClass} mt-2 rounded`} />
          <code className='mt-2 block text-sm'>{name.toLowerCase()}</code>
        </div>
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-lg border'>
      <div className={`${bgClass} ${textClass} p-4`}>
        <h3 className='text-lg font-semibold'>{name}</h3>
        <code className='block text-sm'>{bgClass}</code>
        <code className='block text-sm'>{textClass}</code>
      </div>
    </div>
  );
}

function ColorPalette() {
  return (
    <div className='space-y-8 p-4'>
      <div>
        <h2 className='mb-4 text-2xl font-bold'>UI Colors</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <ColorCard name='Primary' bgClass='bg-primary' textClass='text-primary-foreground' />
          <ColorCard
            name='Secondary'
            bgClass='bg-secondary'
            textClass='text-secondary-foreground'
          />
          <ColorCard name='Muted' bgClass='bg-muted' textClass='text-muted-foreground' />
          <ColorCard name='Accent' bgClass='bg-accent' textClass='text-accent-foreground' />
          <ColorCard
            name='Destructive'
            bgClass='bg-destructive'
            textClass='text-destructive-foreground'
          />
        </div>
      </div>

      <div>
        <h2 className='mb-4 text-2xl font-bold'>System Colors</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <ColorCard name='Background' bgClass='bg-background' textClass='text-foreground' />
          <ColorCard name='Card' bgClass='bg-card' textClass='text-card-foreground' />
          <ColorCard name='Popover' bgClass='bg-popover' textClass='text-popover-foreground' />
        </div>
      </div>

      <div>
        <h2 className='mb-4 text-2xl font-bold'>Border Colors</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <ColorCard name='Border' bgClass='bg-border' textClass='' isBorder />
          <ColorCard name='Input' bgClass='bg-input' textClass='' isBorder />
          <ColorCard name='Ring' bgClass='bg-ring' textClass='' isBorder />
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: 'Design System/Color Palette',
  component: ColorPalette,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ColorPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
