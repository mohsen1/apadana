// story for colors

import { Meta, StoryObj } from '@storybook/react';

function ColorPalette() {
  const colors = [
    'primary',
    'secondary',
    'muted',
    'destructive',
    // For some reason, we don't have these colors in the Storybook.
    // TODO: investigate and fix.
    'accent',
    'border',
    'input',
    'ring',
  ];

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Color Palette</h1>
      <p className='text-accent-foreground mb-4'>
        We try to keep the number of colors to a minimum for easier
        customization.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {colors.map((color) => (
          <div key={color} className='border rounded-lg overflow-hidden'>
            <div className={`h-24 bg-${color} text-${color}-foreground p-4`}>
              <h2 className='text-lg font-semibold mb-2'>{color}</h2>
              <div className={`h-18 text-sm text-${color}-foreground`}>
                <code className='font-thin block font-mono'>bg-{color}</code>
                <code className='font-thin block font-mono'>
                  text-{color}-foreground
                </code>
                <div className='flex mt-2'>
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((shade) => (
                    <div
                      key={shade}
                      className={`
                          w-6 h-6 
                          font-mono
                          text-xs
                          bg-${color}/${shade}
                        `}
                      title={`${color}/${shade}`}
                    >
                      /{shade}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'ColorPalette',
  component: ColorPalette,
} satisfies Meta<typeof ColorPalette>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {};
