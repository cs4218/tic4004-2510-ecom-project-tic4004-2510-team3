import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Search from './Search';

/* 
  To Hide console error when running this test as there is no unique key prop in map()
*/

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

// Mock the search context
const mockUseSearch = jest.fn();
jest.mock('../context/search', () => ({
  useSearch: () => mockUseSearch()
}));

// Mock the Layout component
jest.mock('../components/Layout', () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout">
        <h1 data-testid="layout-title">{title}</h1>
        {children}
      </div>
    );
  };
});

describe('Search Component', () => {

  describe('Empty Results State', () => {
    // Testing for whether the display result is in the corrct layout
    it('should display correct layout title', () => {
      mockUseSearch.mockReturnValue([{ keyword: '', results: [] }, jest.fn()]);

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>
      );

      expect(screen.getByTestId('layout-title')).toHaveTextContent('Search results');
    });
  });

  describe('Search Results Display', () => {
    const mockLaptop = {
      _id: '1',
      name: 'Laptop',
      description: 'A powerful laptop',
      price: 1499.99,
      category: 'electronics'
    };

    // Testing for product when perform search
    it('should display correct result count when product is found', () => {
      mockUseSearch.mockReturnValue([{ keyword: 'laptop', results: [mockLaptop] }, jest.fn()]);

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>
      );

      expect(screen.getByText('Found 1')).toBeInTheDocument();
      expect(screen.queryByText('No Products Found')).not.toBeInTheDocument();
    });

    // Testing for product when keyword is being search and display result is correct
    it('should render laptop product card', () => {
      mockUseSearch.mockReturnValue([{ keyword: 'laptop', results: [mockLaptop] }, jest.fn()]);

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>
      );

      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    // Testing for correct product image being shown
    it('should render product images with correct src', () => {
      mockUseSearch.mockReturnValue([{ keyword: 'laptop', results: [mockLaptop] }, jest.fn()]);

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>
      );

      const productImage = screen.getByAltText('Laptop');
      expect(productImage).toHaveAttribute('src', '/api/v1/product/product-photo/1');
    });

    // Testing for "ADD TO CART" button
    it('should render "ADD TO CART" button for each product', () => {
      mockUseSearch.mockReturnValue([{ keyword: 'laptop', results: [mockLaptop] }, jest.fn()]);

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>
      );

      expect(screen.getByText('ADD TO CART')).toBeInTheDocument();
    });

    // Testing for "More Details" button
    it('should render "More Details" button for each product', () => {
      mockUseSearch.mockReturnValue([{ keyword: 'laptop', results: [mockLaptop] }, jest.fn()]);

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>
      );

      expect(screen.getByText('More Details')).toBeInTheDocument();
    });

  });

  describe('Product Card Structure', () => {

    // Testing for multiple product when keyword is being search
    it('should render all products in the results', () => {
      const multipleProducts = [
        { 
          _id: '1', 
          name: 'Textbook', 
          description: 'A comprehensive textbook', 
          price: 79.99, 
          category: 'Book' 
        },
        { 
          _id: '2', 
          name: 'The Law of Contract in Singapore', 
          description: 'Bestselling book', 
          price: 54.99, 
          category: 'Book' 
        }
      ];

      mockUseSearch.mockReturnValue([{ keyword: 'book', results: multipleProducts }, jest.fn()]);

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>
      );

      expect(screen.getByText('Textbook')).toBeInTheDocument();
      expect(screen.getByText('The Law of Contract in Singapore')).toBeInTheDocument();
    });
  });
});
