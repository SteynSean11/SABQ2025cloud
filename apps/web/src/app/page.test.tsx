import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home page', () => {
  it('should render the welcome message', () => {
    render(<Home />);
    const welcomeMessage = screen.getByText(/Live Like Royalty on Any Budget/i);
    expect(welcomeMessage).toBeInTheDocument();
  });
});

