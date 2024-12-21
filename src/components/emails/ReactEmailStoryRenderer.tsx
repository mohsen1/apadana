import { render } from '@react-email/components';
import * as cheerio from 'cheerio';
import { useEffect, useState } from 'react';

import logger from '@/utils/logger';

/**
 * Renders a React Email component in a storybook story.
 * Since React Email uses a Promise to render the email, we need to use a
 * state to render the email after it's rendered.
 * React Emails also might have elements such as <body> or <html> which
 * will cause warnings in the console.
 * This component mitigates those issues.
 */
export function ReactEmailStoryRenderer<C extends React.ElementType>({
  Component,
  props,
}: {
  Component: C;
  props: React.ComponentProps<C>;
}) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let mounted = true;

    render(<Component {...props} />)
      .then((renderedHtml) => {
        if (mounted) {
          // Use cheerio to parse the HTML and extract body content
          const $ = cheerio.load(renderedHtml);
          const bodyContent = $('body').html() || renderedHtml;
          setHtml(bodyContent);
        }
      })
      .catch((error) => {
        logger.error('Error rendering email:', error);
      });

    return () => {
      mounted = false;
      setHtml(''); // Clean up when unmounting
    };
  }, [Component, props]);

  return (
    <div
      data-testid='react-email-story-renderer'
      className='email-preview'
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}
