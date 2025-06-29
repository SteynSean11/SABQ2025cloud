import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home page', () => {
  it('should render the welcome message', () => {
    render(<Home />);
    const welcomeMessage = screen.getByText(/Welcome to SA Budget Queen/i);
    expect(welcomeMessage).toBeInTheDocument();
  });
});
