import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Categories from './Categories';

// Mock the useCategory hook
jest.mock('../hooks/useCategory', () => jest.fn());

// Mock Layout component
jest.mock('../components/Layout', () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

describe('Categories Component', () => {
  const mockUseCategory = require('../hooks/useCategory');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Tests for rendering categories ---
  it('renders layout container', () => {
    mockUseCategory.mockReturnValue([]);
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('renders "Electronics" category', () => {
    mockUseCategory.mockReturnValue([{ _id: '1', name: 'Electronics', slug: 'electronics' }]);
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  // --- Tests for empty state ---
  it('does not render any category links when no categories', () => {
    mockUseCategory.mockReturnValue([]);
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  // --- Tests for category links ---
  it('Electronics link has correct href', () => {
    mockUseCategory.mockReturnValue([{ _id: '1', name: 'Electronics', slug: 'electronics' }]);
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );
    const electronicsLink = screen.getByText('Electronics');
    expect(electronicsLink.closest('a')).toHaveAttribute('href', '/category/electronics');
  });
  // --- Tests for Layout prop ---
  it('passes correct title prop to Layout', () => {
    mockUseCategory.mockReturnValue([]);
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );
    const layout = screen.getByTestId('layout');
    expect(layout).toHaveAttribute('data-title', 'All Categories');
  });
});
