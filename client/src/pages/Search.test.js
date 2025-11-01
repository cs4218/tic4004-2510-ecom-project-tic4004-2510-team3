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

  describe('Search Results Display', () => {
    const mockLaptop = {
      _id: '1',
      name: 'Laptop',
      description: 'A powerful laptop',
      price: 1499.99,
      category: 'electronics'
    };

    //5. Testing empty search result branch
    it('should display "No Products Found" when search results are empty', () => {
      mockUseSearch.mockReturnValue([{ keyword: 'nothing', results: [] }, jest.fn()]);

      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>
      );

      expect(screen.getByText('No Products Found')).toBeInTheDocument();
      expect(screen.queryByText('Found')).not.toBeInTheDocument();
    });


    // 6. Testing for product count when perform search for a product
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

    //7. Testing for correct product image with correct src
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
  });

  describe('Product Card Structure', () => {

    //8. Testing for multiple product when keyword is being search
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
