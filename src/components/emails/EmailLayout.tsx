import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ preview, children }) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body className='font-sans'>
      <Container className='mx-auto mb-1 py-5'>
        {/* Header */}
        <Section className='border-b border-zinc-300 px-10 py-8'>
          <Img
            src='https://apadana.app/images/logo@2x.png'
            width='120'
            height='40'
            alt='Apadana'
            className='mx-auto'
          />
        </Section>

        {/* Main Content */}
        <Section className='px-10 pt-10'>{children}</Section>

        {/* Footer */}
        <Section className='px-10 pt-10'>
          <Row>
            <Column align='center'>
              <Text className='text-muted-foreground text-center text-sm leading-4'>
                © {new Date().getFullYear()} Apadana. All rights reserved.
              </Text>
              <Text className='text-muted-foreground text-center text-sm leading-4'>
                <Link href='https://apadana.app/terms' className='text-muted-foreground underline'>
                  Terms of Service
                </Link>
                {' • '}
                <Link
                  href='https://apadana.app/privacy'
                  className='text-muted-foreground underline'
                >
                  Privacy Policy
                </Link>
              </Text>
            </Column>
          </Row>
          <Row>
            <Column align='center' className='mt-3'>
              <Link
                href='https://facebook.com/apadana_app'
                className='text-muted-foreground mx-2 inline-block text-sm underline'
              >
                Facebook
              </Link>
              <Link
                href='https://twitter.com/apadana_app'
                className='text-muted-foreground mx-2 inline-block text-sm underline'
              >
                Twitter
              </Link>
              <Link
                href='https://instagram.com/apadana_app'
                className='text-muted-foreground mx-2 inline-block text-sm underline'
              >
                Instagram
              </Link>
            </Column>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default EmailLayout;
