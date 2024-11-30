import '@testing-library/jest-dom';

// Allow router mocks.
// eslint-disable-next-line no-undef
jest.mock('next/router', () => require('next-router-mock'));

jest.mock('@/lib/auth/session', () => ({
  getSession: () => Promise.resolve({ userId: 'test-user-id' }),
}));
