// story for colors

import { Meta, StoryObj } from '@storybook/react';

interface ColorCardProps {
  name: string;
  bgClass: string;
  textClass: string;
  isBorder?: boolean;
}

function ColorCard({
  name,
  bgClass,
  textClass,
  isBorder = false,
}: ColorCardProps) {
  if (isBorder) {
    return (
      <div className='border rounded-lg overflow-hidden'>
        <div className='bg-background p-4'>
          <h3 className='text-lg font-semibold'>{name}</h3>
          <div className={`h-8 ${bgClass} rounded mt-2`} />
          <code className='text-sm block mt-2'>{name.toLowerCase()}</code>
        </div>
      </div>
    );
  }

  return (
    <div className='border rounded-lg overflow-hidden'>
      <div className={`${bgClass} ${textClass} p-4`}>
        <h3 className='text-lg font-semibold'>{name}</h3>
        <code className='text-sm block'>{bgClass}</code>
        <code className='text-sm block'>{textClass}</code>
      </div>
    </div>
  );
}

function ColorPalette() {
  return (
    <div className='p-4 space-y-8'>
      <div>
        <h2 className='text-2xl font-bold mb-4'>UI Colors</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <ColorCard
            name='Primary'
            bgClass='bg-primary'
            textClass='text-primary-foreground'
          />
          <ColorCard
            name='Secondary'
            bgClass='bg-secondary'
            textClass='text-secondary-foreground'
          />
          <ColorCard
            name='Muted'
            bgClass='bg-muted'
            textClass='text-muted-foreground'
          />
          <ColorCard
            name='Accent'
            bgClass='bg-accent'
            textClass='text-accent-foreground'
          />
          <ColorCard
            name='Destructive'
            bgClass='bg-destructive'
            textClass='text-destructive-foreground'
          />
        </div>
      </div>

      <div>
        <h2 className='text-2xl font-bold mb-4'>System Colors</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <ColorCard
            name='Background'
            bgClass='bg-background'
            textClass='text-foreground'
          />
          <ColorCard
            name='Card'
            bgClass='bg-card'
            textClass='text-card-foreground'
          />
          <ColorCard
            name='Popover'
            bgClass='bg-popover'
            textClass='text-popover-foreground'
          />
        </div>
      </div>

      <div>
        <h2 className='text-2xl font-bold mb-4'>Border Colors</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
