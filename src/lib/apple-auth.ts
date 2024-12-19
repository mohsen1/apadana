/**
 * This is a minimal placeholder example for Apple OAuth helpers. You’ll need to:
 *  1) Configure environment variables (APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_CLIENT_ID, APPLE_PRIVATE_KEY, etc.).
 *  2) Install any dependencies (e.g. jsonwebtoken) you need to generate the signed JWT.
 *  3) Adjust these methods to handle your Apple developer config.
 */
import jwt from 'jsonwebtoken';

/**
 * Generate the Apple client_secret (a signed JWT).
 */
export async function generateAppleClientSecret(): Promise<string> {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const clientId = process.env.APPLE_CLIENT_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!teamId || !keyId || !clientId || !privateKey) {
    throw new Error(
      'Missing one of APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_CLIENT_ID, or APPLE_PRIVATE_KEY in environment',
    );
  }

  // Apple requires the "iss" to be your Apple Team ID,
  // "sub" to be the Service ID (same as clientId),
  // and "aud" to be https://appleid.apple.com
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 60 * 60 * 24, // valid for 24 hours
    aud: 'https://appleid.apple.com',
    sub: clientId,
  };

  // Sign the token with your private key
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    keyid: keyId,
  });

  return token;
}

/**
 * Exchange the "code" returned from Apple for tokens.
 */
export async function exchangeAppleCodeForTokens(code: string) {
  const clientId = process.env.APPLE_CLIENT_ID;
  const clientSecret = await generateAppleClientSecret();

  // Apple token endpoint
  const url = 'https://appleid.apple.com/auth/token';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId ?? '',
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Apple token exchange failed: ${await response.text()}`);
  }

  return (await response.json()) as {
    access_token?: string;
    id_token?: string;
    expires_in?: number;
    refresh_token?: string;
    token_type?: string;
  };
}

/**
 * Extract Apple user info from the returned id_token.
 * Depending on your requirements, you may
 * just decode or fully verify the JWT signature.
 */
export async function getAppleProfile(idToken: string) {
  // For a production app, you would verify the signature. For brevity, we do a simple decode.
  // Decoded token often includes "email", "sub", "email_verified", and possibly "given_name" / "family_name" if first login.
  const decoded = jwt.decode(idToken) as
    | {
        email?: string;
        sub?: string;
        given_name?: string;
        family_name?: string;
      }
    | undefined;

  if (!decoded) {
    throw new Error('Unable to decode Apple ID token');
  }

  // The first time a user logs in with Apple and allows sharing, you might get name fields in the token.
  // Apple only returns "given_name" and "family_name" once, so you may not always receive them.
  return {
    email: decoded.email,
    firstName: decoded.given_name,
    lastName: decoded.family_name,
    userId: decoded.sub,
  };
}
