import { render } from '@react-email/components';
import * as cheerio from 'cheerio';

/**
 * Renders a React Email component in a storybook story.
 * Since React Email uses a Promise to render the email, we handle
 * the async rendering directly.
 */
export async function ReactEmailStoryRenderer<C extends React.ElementType>({
  Component,
  props,
}: {
  Component: C;
  props: React.ComponentProps<C>;
}) {
  const bodyContent = await renderEmail(Component, props);

  return (
    <div
      data-testid='react-email-story-renderer'
      className='email-preview'
      dangerouslySetInnerHTML={{
        __html: bodyContent,
      }}
    />
  );
}

async function renderEmail(
  Component: React.ElementType,
  props: React.ComponentProps<typeof Component>,
) {
  const renderedHtml = await render(<Component {...props} />);
  const $ = cheerio.load(renderedHtml);
  const bodyContent = $('body').html() || renderedHtml;
  return bodyContent;
}
