import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders the SPAR generator', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /SPAR# Generator/i })).toBeInTheDocument();
});
