import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Contact from './Contact';

//Mock Layout 
jest.mock('../components/Layout', () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout">
        <div data-testid="layout-title">{title}</div>
        <div data-testid="layout-children">{children}</div>
      </div>
    );
  };
});

// Mock react-icons
jest.mock('react-icons/bi', () => ({
  BiMailSend: () => <span data-testid="mail-icon">Mail</span>,
  BiPhoneCall: () => <span data-testid="phone-icon">Phone</span>,
  BiSupport: () => <span data-testid="support-icon">Support</span>,
}), { virtual: true });

describe('Contact Component', () => {

  // Test Component can be mount without crashing
  it('renders Contact component without crash', () => {
    render(<Contact />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  // Test for display contact us heading
  it('passes correct title to Layout', () => {
    render(<Contact />);
    expect(screen.getByTestId('layout-title')).toHaveTextContent('Contact us');
  });

  // Test whether 
  it('renders informational paragraph', () => {
    render(<Contact />);
    expect(screen.getByText(/For any query or info about product/i)).toBeInTheDocument();
  });

  // Test whether it can display email info correctly
  it('renders email contact information', () => {
    render(<Contact />);
    expect(screen.getByText(/www.help@ecommerceapp.com/i)).toBeInTheDocument();
  });


  // Test whether is can display contact info correctly 
  it('renders phone contact information', () => {
    render(<Contact />);
    expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();
  });

  // Test whether it can display toll free and contact correctly
  it('renders support contact information', () => {
    render(<Contact />);
    expect(screen.getByText(/1800-0000-0000/i)).toBeInTheDocument();
    expect(screen.getByText(/toll free/i)).toBeInTheDocument();
  });


  // Test whether it is albe to render the details in correct order
  it('renders contact methods in correct order', () => {
    render(<Contact />);
    const contactLines = screen.getAllByText(/Mail|Phone|Support|@|012|1800/i);
    expect(contactLines.length).toBeGreaterThanOrEqual(3);
  });

});
