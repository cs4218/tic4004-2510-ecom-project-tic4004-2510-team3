import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Policy from './Policy';

// Mock Layout to isolate component
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

describe('Policy Component', () => {

  // Test on component renders
  test('renders Policy component without errors', () => {
    render(<Policy />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  // Test on title is passed correctly to Layout
  test('passes correct title to Layout', () => {
    render(<Policy />);
    expect(screen.getByTestId('layout-title')).toHaveTextContent('Privacy Policy');
  });

  // Test on image is rendered with correct attributes
  test('render image with correct src and alt', () => {
    render(<Policy />);
    const image = screen.getByAltText('contactus');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/contactus.jpeg');
  });

  // Test on whether it renders all 7 privacy policy lines
  test('renders all privacy policy text content', () => {
    render(<Policy />);
    expect(screen.getAllByText('add privacy policy')).toHaveLength(7);
  });

  // Test on whether each privacy line is inside a paragraph
  test('wraps each privacy policy text in paragraph tags', () => {
    render(<Policy />);
    const paragraphs = screen.getAllByText('add privacy policy');
    paragraphs.forEach(p => expect(p.tagName).toBe('P'));
  });

  // Test on whether there is any interactive elements exist
  test('has no interactive elements', () => {
    render(<Policy />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

});
