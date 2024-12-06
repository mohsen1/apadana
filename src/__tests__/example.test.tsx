import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Example test', () => {
  it('should work', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
