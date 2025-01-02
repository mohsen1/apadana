import { useRef } from 'react';
import { AriaButtonProps, mergeProps, useButton, useFocusRing } from 'react-aria';

export function CalendarButton(props: AriaButtonProps<'button'>) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);
  const { focusProps, isFocusVisible } = useFocusRing();
  return (
    <button
      {...mergeProps(buttonProps, focusProps)}
      ref={ref}
      className={`rounded-full p-2 ${props.isDisabled ? '/30' : ''} ${
        !props.isDisabled ? 'hover:bg-sky-500/40 active:bg-sky-500/45' : ''
      } outline-none ${isFocusVisible ? 'ring-2 ring-sky-500/50 ring-offset-2' : ''}`}
    >
      {props.children}
    </button>
  );
}
