import { useRef } from 'react';
import {
  AriaButtonProps,
  mergeProps,
  useButton,
  useFocusRing,
} from 'react-aria';

export function CalendarButton(props: AriaButtonProps<'button'>) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);
  const { focusProps, isFocusVisible } = useFocusRing();
  return (
    <button
      {...mergeProps(buttonProps, focusProps)}
      ref={ref}
      // TODO: colors
      className={`p-2 rounded-full ${props.isDisabled ? 'text-gray-400' : ''} ${
        !props.isDisabled ? 'hover:bg-violet-100 active:bg-violet-200' : ''
      } outline-none ${
        isFocusVisible ? 'ring-2 ring-offset-2 ring-purple-600' : ''
      }`}
    >
      {props.children}
    </button>
  );
}
