// About.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import About from './About';

// Mock the Layout component
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

describe('About Component', () => {
  
  // Test on Component renders without crashing
  it('renders About component without errors', () => {
    render(<About />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  // Test Image is renders correctly with proper style and layout
  it('renders image correctly with proper style and layout', () => {
    render(<About />);
    const image = screen.getByAltText('contactus');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/about.jpeg');
    expect(image).toHaveStyle({ width: '100%' });
  });

  // Test the content text renders correctly
  it('renders content text correctly', () => {
    render(<About />);
    const contentText = screen.getByText('Add text');
    expect(contentText).toBeInTheDocument();
    expect(contentText.tagName).toBe('P');
  });

});
