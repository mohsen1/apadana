import { zodResolver } from '@hookform/resolvers/zod';
import { ToastProvider, ToastViewport } from '@radix-ui/react-toast';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { toast } from '@/hooks/use-toast';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Checkbox } from './checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';
import { Progress } from './progress';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Separator } from './separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';
import { Skeleton } from './skeleton';
import { Switch } from './switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Textarea } from './textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const meta = {
  title: 'UI/Components',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Example form schema
const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
});

export const ComplexForm: Story = {
  render: () => {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: '',
        email: '',
      },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
      toast({
        title: 'Form submitted',
        description: `Username: ${values.username}, Email: ${values.email}`,
      });
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-[400px] space-y-8'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='Enter username' {...field} />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='Enter email' {...field} />
                </FormControl>
                <FormDescription>Enter your email address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Submit</Button>
        </form>
      </Form>
    );
  },
};

export const AlertDialogs: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive'>Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Sheets: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>
            This is a sheet component that slides in from the side.
          </SheetDescription>
        </SheetHeader>
        <div className='py-4'>
          <p>Sheet content goes here.</p>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const ComplexDropdownMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuItem>Profile Settings</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem className='text-red-500'>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// TODO: Fix the ToastNotifications story
export const ToastNotifications: Story = {
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
  render: function ToastNotificationsStory() {
    return (
      <Button
        onClick={() => {
          toast({
            title: 'Scheduled: Catch up',
            description: 'Friday, February 10, 2024 at 5:57 PM',
          });
        }}
      >
        Show Toast
      </Button>
    );
  },
};

// TODO: Fix the InteractiveSheet story
export const InteractiveSheet: Story = {
  render: function InteractiveSheetStory() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant='outline'>Open Interactive Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Interactive Sheet</SheetTitle>
            <SheetDescription>This sheet demonstrates state management.</SheetDescription>
          </SheetHeader>
          <div className='py-4'>
            <Button onClick={() => setIsOpen(false)} className='mt-4'>
              Close Sheet
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
};

export const Avatars: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Avatar>
        <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className='flex gap-2'>
      <Badge>Default</Badge>
      <Badge variant='secondary'>Secondary</Badge>
      <Badge variant='destructive'>Destructive</Badge>
      <Badge variant='outline'>Outline</Badge>
    </div>
  ),
};

export const Cards: Story = {
  render: () => (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Checkboxes: Story = {
  render: () => (
    <div className='flex items-center space-x-2'>
      <Checkbox id='terms' />
      <label
        htmlFor='terms'
        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};

export const ProgressBars: Story = {
  render: () => (
    <div className='w-[400px]'>
      <div className='w-[60%] space-y-4'>
        <Progress value={33} />
        <Progress value={66} />
        <Progress value={100} />
      </div>
    </div>
  ),
};

export const RadioGroupExample: Story = {
  render: () => (
    <RadioGroup defaultValue='option-one'>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='option-one' id='option-one' />
        <label htmlFor='option-one'>Option One</label>
      </div>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='option-two' id='option-two' />
        <label htmlFor='option-two'>Option Two</label>
      </div>
    </RadioGroup>
  ),
};

export const SelectMenus: Story = {
  render: () => (
    <Select>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Select a fruit' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='apple'>Apple</SelectItem>
        <SelectItem value='banana'>Banana</SelectItem>
        <SelectItem value='orange'>Orange</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Separators: Story = {
  render: () => (
    <div className='space-y-4'>
      <div>
        <h2>Horizontal Separator</h2>
      </div>
      <Separator />
      <div className='flex h-5 items-center space-x-4'>
        <div>Item 1</div>
        <Separator orientation='vertical' />
        <div>Item 2</div>
        <Separator orientation='vertical' />
        <div>Item 3</div>
      </div>
    </div>
  ),
};

export const Skeletons: Story = {
  render: () => (
    <div className='flex items-center space-x-4'>
      <Skeleton className='h-12 w-12 rounded-full' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-[250px]' />
        <Skeleton className='h-4 w-[200px]' />
      </div>
    </div>
  ),
};

export const Switches: Story = {
  render: () => (
    <div className='flex items-center space-x-2'>
      <Switch id='airplane-mode' />
      <label htmlFor='airplane-mode'>Airplane Mode</label>
    </div>
  ),
};

export const Tables: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>Active</TableCell>
          <TableCell>Developer</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>Inactive</TableCell>
          <TableCell>Designer</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const TabsExample: Story = {
  render: () => (
    <Tabs defaultValue='account' className='w-[400px]'>
      <TabsList>
        <TabsTrigger className='data-[state=active]:font-bold' value='account'>
          Account
        </TabsTrigger>
        <TabsTrigger className='data-[state=active]:font-bold' value='password'>
          Password
        </TabsTrigger>
      </TabsList>
      <TabsContent value='account'>Account settings here.</TabsContent>
      <TabsContent value='password'>Change your password here.</TabsContent>
    </Tabs>
  ),
};

export const TextareaExample: Story = {
  render: () => <Textarea placeholder='Type your message here.' />,
};

export const TooltipExample: Story = {
  decorators: [
    (Story) => (
      <div className='flex items-center justify-center p-20'>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant='outline'>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={5}>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
