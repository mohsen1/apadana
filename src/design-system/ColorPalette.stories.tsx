// story for colors

import { Meta, StoryObj } from '@storybook/react';

interface ColorCardProps {
  name: string;
  bgClass: string;
  textClass: string;
  isBorder?: boolean;
  children?: React.ReactNode;
}

function ColorSwatch({ className, title }: { className: string; title: string }) {
  return (
    <div
      className={`m-2 inline-grid h-[4ch] w-[4ch] place-items-center rounded font-mono ${className}`}
    >
      {title}
    </div>
  );
}

function ColorCard({ name, bgClass, textClass, isBorder = false, children }: ColorCardProps) {
  if (isBorder) {
    return (
      <div className='overflow-hidden rounded-lg border'>
        <div className='bg-background p-4'>
          <h3 className='text-lg font-semibold'>{name}</h3>
          <div className={`h-8 ${bgClass} mt-2 rounded`} />
          <code className='mt-2 block text-sm'>{name.toLowerCase()}</code>
          <div className='bg-background mt-2 rounded'>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg border ${bgClass}`}>
      <div className={`${textClass} p-4`}>
        <h3 className='text-lg font-semibold'>{name}</h3>
        <code className='block text-sm'>{bgClass}</code>
        <code className='block text-sm'>{textClass}</code>
        <div className='bg-background mt-2 rounded'>{children}</div>
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
          <ColorCard name='Primary' bgClass='bg-primary' textClass='text-primary-foreground'>
            <ColorSwatch
              className='bg-primary-100 text-foreground dark:text-background'
              title='100'
            />
            <ColorSwatch
              className='bg-primary-200 text-foreground dark:text-background'
              title='200'
            />
            <ColorSwatch
              className='bg-primary-300 text-foreground dark:text-background'
              title='300'
            />
            <ColorSwatch
              className='bg-primary-400 text-foreground dark:text-background'
              title='400'
            />
            <ColorSwatch className='bg-primary-500' title='500' />
            <ColorSwatch className='bg-primary-600' title='600' />
            <ColorSwatch className='bg-primary-700 dark:text-background' title='700' />
            <ColorSwatch className='bg-primary-800 dark:text-background' title='800' />
            <ColorSwatch className='bg-primary-900 dark:text-background' title='900' />
            <ColorSwatch className='bg-primary-950 dark:text-background' title='950' />
          </ColorCard>
          <ColorCard
            name='Secondary'
            bgClass='bg-secondary'
            textClass='text-secondary-foreground'
          />
          <ColorCard name='Muted' bgClass='bg-muted' textClass='text-muted-foreground' />
          <ColorCard name='Accent' bgClass='bg-accent' textClass='text-accent-foreground'>
            <ColorSwatch className='bg-accent-100 dark:text-background' title='100' />
            <ColorSwatch className='bg-accent-200 dark:text-background' title='200' />
            <ColorSwatch className='bg-accent-300 dark:text-background' title='300' />
            <ColorSwatch
              className='bg-accent-400 text-foreground dark:text-background'
              title='400'
            />
            <ColorSwatch className='bg-accent-500' title='500' />
            <ColorSwatch className='bg-accent-600' title='600' />
            <ColorSwatch className='bg-accent-700 text-background' title='700' />
            <ColorSwatch className='bg-accent-800 text-background' title='800' />
            <ColorSwatch className='bg-accent-900 text-background' title='900' />
            <ColorSwatch className='bg-accent-950 text-background' title='950' />
          </ColorCard>
        </div>
      </div>
      <div>
        <h2 className='mb-4 text-2xl font-bold'>Status Colors</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <ColorCard
            name='Destructive'
            bgClass='bg-destructive'
            textClass='text-destructive-foreground'
          >
            <ColorSwatch
              className='bg-destructive-100 text-foreground dark:text-background'
              title='100'
            />
            <ColorSwatch
              className='bg-destructive-200 text-foreground dark:text-background'
              title='200'
            />
            <ColorSwatch
              className='bg-destructive-300 text-foreground dark:text-background'
              title='300'
            />
            <ColorSwatch
              className='bg-destructive-400 text-foreground dark:text-background'
              title='400'
            />
            <ColorSwatch className='bg-destructive-500' title='500' />
            <ColorSwatch className='bg-destructive-600' title='600' />
            <ColorSwatch className='bg-destructive-700 dark:text-background' title='700' />
            <ColorSwatch className='bg-destructive-800 dark:text-background' title='800' />
            <ColorSwatch className='bg-destructive-900 dark:text-background' title='900' />
            <ColorSwatch className='bg-destructive-950 dark:text-background' title='950' />
          </ColorCard>
          <ColorCard name='Success' bgClass='bg-success' textClass='text-success-foreground'>
            <ColorSwatch
              className='bg-success-100 text-foreground dark:text-background'
              title='100'
            />
            <ColorSwatch
              className='bg-success-200 text-foreground dark:text-background'
              title='200'
            />
            <ColorSwatch
              className='bg-success-300 text-foreground dark:text-background'
              title='300'
            />
            <ColorSwatch
              className='bg-success-400 text-foreground dark:text-background'
              title='400'
            />
            <ColorSwatch className='bg-success-500' title='500' />
            <ColorSwatch className='bg-success-600' title='600' />
            <ColorSwatch className='bg-success-700 dark:text-background' title='700' />
            <ColorSwatch className='bg-success-800 dark:text-background' title='800' />
            <ColorSwatch className='bg-success-900 dark:text-background' title='900' />
            <ColorSwatch className='bg-success-950 dark:text-background' title='950' />
          </ColorCard>
          <ColorCard name='Warning' bgClass='bg-warning' textClass='text-warning-foreground'>
            <ColorSwatch
              className='bg-warning-100 text-foreground dark:text-background'
              title='100'
            />
            <ColorSwatch
              className='bg-warning-200 text-foreground dark:text-background'
              title='200'
            />
            <ColorSwatch
              className='bg-warning-300 text-foreground dark:text-background'
              title='300'
            />
            <ColorSwatch
              className='bg-warning-400 text-foreground dark:text-background'
              title='400'
            />
            <ColorSwatch className='bg-warning-500' title='500' />
            <ColorSwatch className='bg-warning-600' title='600' />
            <ColorSwatch className='bg-warning-700 dark:text-background' title='700' />
            <ColorSwatch className='bg-warning-800 dark:text-background' title='800' />
            <ColorSwatch className='bg-warning-900 dark:text-background' title='900' />
            <ColorSwatch className='bg-warning-950 dark:text-background' title='950' />
          </ColorCard>
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
          <ColorCard name='Ring' bgClass='bg-ring' textClass='' isBorder>
            <ColorSwatch className='bg-ring-100 text-foreground dark:text-foreground' title='100' />
            <ColorSwatch className='bg-ring-200 text-foreground dark:text-foreground' title='200' />
            <ColorSwatch className='bg-ring-300 text-foreground dark:text-foreground' title='300' />
            <ColorSwatch className='bg-ring-400 text-foreground' title='400' />
            <ColorSwatch className='bg-ring-500 text-background' title='500' />
            <ColorSwatch className='bg-ring-600 text-background' title='600' />
            <ColorSwatch className='bg-ring-700 text-background' title='700' />
            <ColorSwatch className='bg-ring-800 text-background' title='800' />
            <ColorSwatch className='bg-ring-900 text-background' title='900' />
            <ColorSwatch className='bg-ring-950 text-background' title='950' />
          </ColorCard>
        </div>
      </div>

      <div>
        <h2 className='mb-4 text-2xl font-bold'>Additional Base Colors</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <ColorCard name='Zinc' bgClass='bg-zinc' textClass='text-zinc-foreground'>
            <ColorSwatch className='bg-zinc-50' title='50' />
            <ColorSwatch className='bg-zinc-100' title='100' />
            <ColorSwatch className='bg-zinc-200' title='200' />
            <ColorSwatch className='bg-zinc-300' title='300' />
            <ColorSwatch className='bg-zinc-400' title='400' />
            <ColorSwatch className='text-background bg-zinc-500' title='500' />
            <ColorSwatch className='text-background bg-zinc-600' title='600' />
            <ColorSwatch className='text-background bg-zinc-700' title='700' />
            <ColorSwatch className='text-background bg-zinc-800' title='800' />
            <ColorSwatch className='text-background bg-zinc-900' title='900' />
            <ColorSwatch className='text-background bg-zinc-950' title='950' />
          </ColorCard>
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
