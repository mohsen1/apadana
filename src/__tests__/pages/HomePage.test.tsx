import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

import HomePage from '@/app/page';

vi.mock('@/app/action', () => ({
  earlyAccessSignup: vi.fn(),
}));

vi.mock('uvcanvas', () => ({
  Novatrix: () => <div>Novatrix</div>,
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '',
}));

describe('Homepage', () => {
  it('renders the Components', () => {
    render(<HomePage />);

    const heading = screen.getByText(/listing/i);

    expect(heading).toBeInTheDocument();
  });
});
