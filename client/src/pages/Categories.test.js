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

  // Test whether the categories are showing up correctly
  it('renders categories correctly', () => {
    const mockCategories = [
      {
         _id: '1', 
        name: 'Electronics', 
        slug: 'electronics' 
      },
      {
         _id: '2', 
         name: 'Book', 
         slug: 'book' 
        },
    ];
    mockUseCategory.mockReturnValue(mockCategories);

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Book')).toBeInTheDocument();
  });

  // Test for empty state where there are no categories
  it('renders empty state when no categories', () => {
    mockUseCategory.mockReturnValue([]);

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  // Test that category links have correct href
  it('category links have correct href', () => {
    const mockCategories = [
      {
         _id: '1', 
         name: 'Electronics', 
         slug: 'electronics' 
        },
      {
         _id: '2', 
         name: 'Book', 
         slug: 'book' 
        },
    ];
    mockUseCategory.mockReturnValue(mockCategories);

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    const electronicsLink = screen.getByText('Electronics');
    const bookLink = screen.getByText('Book');

    expect(electronicsLink.closest('a')).toHaveAttribute('href', '/category/electronics');
    expect(bookLink.closest('a')).toHaveAttribute('href', '/category/book');
  });

  // Test that Layout receives correct title prop
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
