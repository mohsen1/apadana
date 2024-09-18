import { useEffect, useState } from 'react';

/**
 * A component that will fade out after a certain amount of time.
 *
 * @param {React.ReactNode} children - The content to display.
 * @param {number} disappearIn - The number of seconds to display the content for.
 * @param {string} className - The class name to apply to the component.
 */
export function DisappearingComponent({
  children,
  disappearIn = 3,
  className,
}: {
  children: React.ReactNode;
  disappearIn?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const fadeOutDuration = Math.min(disappearIn * 100, 400); // 10% of disappearIn, max 400ms
    const timer = setTimeout(
      () => {
        setOpacity(0);
      },
      disappearIn * 1000 - fadeOutDuration,
    );

    const disappearTimer = setTimeout(() => {
      setVisible(false);
    }, disappearIn * 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(disappearTimer);
    };
  }, [disappearIn]);

  if (!visible) return null;

  return (
    <div
      className={className}
      style={{
        opacity,
        transition: `opacity ${Math.min(disappearIn * 100, 400)}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}
