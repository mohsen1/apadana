import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundImage: 'linear-gradient(to bottom, #075568, #2b9389)',
          letterSpacing: -2,
          fontWeight: 700,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 80,
            backgroundImage:
              'linear-gradient(90deg, rgb(0, 223, 216), rgb(200, 124, 240), rgb(0, 223, 216))',
            backgroundClip: 'text',
            ['-webkit-background-clip' as PropertyKey]: 'text',
            color: 'transparent',
          }}
        >
          Apadana
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 100,
            padding: 20,
            color: 'white',
          }}
        >
          Create your own website for your short-term rental in minutes
        </div>
        <div
          style={{
            color: 'rgb(255,255,255)',
            fontWeight: 100,
            fontSize: 24,
            paddingLeft: 30,
            paddingRight: 30,
          }}
        >
          Get direct bookings, manage your calendar, and communicate with guests
          - all without extra fees.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
