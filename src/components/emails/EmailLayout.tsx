import {
  Body,
  Column,
  Container,
  Font,
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

import { ColorSchemeAwareImg } from '@/components/emails/ColorSchemeAwareImg';

import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  LOGO_WIDE_BLACK_BG,
  LOGO_WIDE_WHITE_BG,
  PRIVACY_URL,
  TERMS_URL,
  TWITTER_URL,
} from './constants';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ preview, children }) => (
  <Html>
    <Head>
      <Font
        fontFamily='Helvetica'
        fallbackFontFamily='sans-serif'
        webFont={{
          url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
          format: 'woff2',
        }}
      />
    </Head>
    <Preview>{preview}</Preview>
    <Body className='bg-background font-sans'>
      <Container className='mx-auto mb-1 py-5'>
        {/* Header */}
        <Section className='px-10 py-8'>
          <Container className='mx-auto mb-4 text-center'>
            <ColorSchemeAwareImg
              src={LOGO_WIDE_WHITE_BG}
              src2x={LOGO_WIDE_WHITE_BG}
              darkSrc={LOGO_WIDE_BLACK_BG}
              darkSrc2x={LOGO_WIDE_BLACK_BG}
              alt='Apadana'
              width={400}
              height={80}
              className='mx-auto mb-4'
            />
          </Container>
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
                <Link className='text-gray-400 hover:text-gray-500' href={TERMS_URL}>
                  Terms
                </Link>
                {' • '}
                <Link className='text-gray-400 hover:text-gray-500' href={PRIVACY_URL}>
                  Privacy Policy
                </Link>
              </Text>
            </Column>
          </Row>
          <Row>
            <Column align='center' className='mt-3'>
              <Link href={FACEBOOK_URL}>
                <Img src={LOGO_WIDE_WHITE_BG} width={24} height={24} alt='Facebook' />
              </Link>
              <Link href={TWITTER_URL}>
                <Img src={LOGO_WIDE_WHITE_BG} width={24} height={24} alt='Twitter' />
              </Link>
              <Link href={INSTAGRAM_URL}>
                <Img src={LOGO_WIDE_WHITE_BG} width={24} height={24} alt='Instagram' />
              </Link>
            </Column>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default EmailLayout;
