import React from 'react';
import { render, screen } from '@testing-library/react';
import Policy from './Policy';

// Mock Layout to isolate Policy component
jest.mock('../components/Layout', () => ({ children, title }) => (
  <div data-testid="layout">
    <h1>{title}</h1>
    {children}
  </div>
));

describe('Policy Component', () => {

  it('renders Layout with correct title', () => {
    render(<Policy />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it("renders image with correct src", () => {
    const { getByAltText } = render(<Policy />);
    const image = getByAltText("contactus");
    expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
  });

  it("renders image with correct alt text", () => {
    const { getByAltText } = render(<Policy />);
    const image = getByAltText("contactus");
    expect(image).toHaveAttribute("alt", "contactus");
  });

  it('renders 7 privacy policy lines', () => {
    render(<Policy />);
    const policyLines = screen.getAllByText(/add privacy policy/i);
    expect(policyLines.length).toBe(7);
  });

});
