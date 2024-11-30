import { render } from '@react-email/components';
import { useState } from 'react';

/**
 * Renders a React Email component in a storybook story.
 * Since React Email uses a Promise to render the email, we need to use a
 * state to render the email after it's rendered.
 * React Emails also might have elements such as <body> or <html> which
 * will cause warnings in the console.
 * This component mitigates those issues.
 * @param Component - The React Email component to render.
 * @param props - The props to pass to the component.
 * @returns A React component that renders the email.
 */
export function ReactEmailStoryRenderer<C extends React.ElementType>({
  Component,
  props,
}: {
  Component: C;
  props: React.ComponentProps<C>;
}) {
  const [html, setHtml] = useState('');
  render(<Component {...props} />).then((html) => {
    setHtml(html);
  });
  return (
    <div
      data-testid='react-email-story-renderer'
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}
