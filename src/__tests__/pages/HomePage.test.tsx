import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import HomePage from '@/app/page';

jest.mock('@/app/action', () => ({
  earlyAccessSignup: jest.fn(),
}));

jest.mock('uvcanvas', () => ({
  Novatrix: () => <div>Novatrix</div>,
}));

describe('Homepage', () => {
  it('renders the Components', () => {
    render(<HomePage />);

    const heading = screen.getByText(/listing/i);

    expect(heading).toBeInTheDocument();
  });
});
