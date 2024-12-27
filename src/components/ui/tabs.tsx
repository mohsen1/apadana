'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      `text-muted-foreground border-b-foreground inline-flex w-full items-center justify-start rounded-md rounded-b-none border-b-2 px-2`,
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'ring-offset-background focus-visible:ring-ring relative inline-flex items-center',
      'justify-center whitespace-nowrap rounded-t-lg px-3 py-1.5 text-sm font-medium',
      'transition-all focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      'state-active:border-t-2 state-active:border-t-foreground state-active:text-foreground',
      'state-active:rounded-t-lg state-active:rounded-b-none',
      'state-active:border-l-2 state-active:border-l-foreground state-active:border-r-2 state-active:border-r-foreground',
      'state-active:bg-foreground state-active:text-background',
      // Add pseudo-elements for bottom corners with borders
      'state-active:after:absolute state-active:after:bottom-[-2px] state-active:after:right-[-16px]',
      'state-active:after:h-4 state-active:after:w-4 state-active:after:bg-transparent',
      'state-active:after:border-b-2 state-active:after:border-foreground state-active:after:border-l-2',
      'state-active:after:rounded-bl-lg',
      'state-active:before:absolute state-active:before:bottom-[-2px] state-active:before:left-[-16px]',
      'state-active:before:h-4 state-active:before:w-4 state-active:before:bg-transparent',
      'state-active:before:border-b-2 state-active:before:border-foreground state-active:before:border-r-2',
      'state-active:before:rounded-br-lg',
      className,
    )}
    {...props}
  />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
