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

  // 9. Render all categories
  it('renders all categories', () => {
    const categories = [
      { _id: '0', name: 'All Categories', slug: 'all-categories' },
      { _id: '1', name: 'Electronics', slug: 'electronics' },
      { _id: '2', name: 'Book', slug: 'book' },
      { _id: '3', name: 'Clothing', slug: 'clothing' }
    ];
    mockUseCategory.mockReturnValue(categories);

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    categories.forEach((c) => {
      expect(screen.getByText(c.name)).toBeInTheDocument();
    });
  });

  // 10. Render each category link with correct href
  it('renders each category link with correct href', () => {
    const categories = [
      { _id: '0', name: 'All Categories', slug: 'all-categories' },
      { _id: '1', name: 'Electronics', slug: 'electronics' },
      { _id: '2', name: 'Book', slug: 'book' },
      { _id: '3', name: 'Clothing', slug: 'clothing' }
    ];
    mockUseCategory.mockReturnValue(categories);

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    categories.forEach((c) => {
      const link = screen.getByText(c.name).closest('a');
      expect(link).toHaveAttribute('href', `/category/${c.slug}`);
    });
  });
});
