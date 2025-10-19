import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import Products from './Products';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
}));

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock child components
jest.mock('../../components/Layout', () => {
  return function MockLayout({ children }) {
    return (
      <div data-testid="layout">
        {children}
      </div>
    );
  };
});

jest.mock('../../components/AdminMenu', () => {
  return function MockAdminMenu() {
    return <div data-testid="admin-menu">Admin Menu</div>;
  };
});

// Mock react-router-dom Link
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid="product-link">
      {children}
    </a>
  ),
}));

describe('Products Component', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Test Product 1',
      description: 'Description for product 1',
      slug: 'test-product-1',
    },
    {
      _id: '2',
      name: 'Test Product 2',
      description: 'Description for product 2',
      slug: 'test-product-2',
    },
    {
      _id: '3',
      name: 'Test Product 3',
      description: 'Description for product 3',
      slug: 'test-product-3',
    },
  ];

  const renderProducts = () => {
    return render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response by default
    axios.get.mockResolvedValue({
      data: { products: mockProducts }
    });
  });

  describe('Component Rendering', () => {
    test('renders Products component with correct title', async () => {
      await act(async () => {
        renderProducts();
      });

      expect(screen.getByText('All Products List')).toBeInTheDocument();
      expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    test('renders products grid layout', async () => {
      await act(async () => {
        renderProducts();
      });

      const gridContainer = screen.getByText('All Products List').closest('.col-md-9');
      expect(gridContainer).toHaveClass('d-flex');
    });
  });

  describe('Product Loading', () => {
    test('loads products on component mount', async () => {
      await act(async () => {
        renderProducts();
      });

      expect(axios.get).toHaveBeenCalledWith('/api/v1/product/get-product');
    });

    test('displays all products after loading', async () => {
      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.getByText('Test Product 3')).toBeInTheDocument();
      });
    });

    test('displays product descriptions', async () => {
      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        expect(screen.getByText('Description for product 1')).toBeInTheDocument();
        expect(screen.getByText('Description for product 2')).toBeInTheDocument();
        expect(screen.getByText('Description for product 3')).toBeInTheDocument();
      });
    });

    test('handles error when loading products fails', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Someething Went Wrong');
      });
    });
  });

  describe('Product Cards', () => {
    test('renders product cards with correct structure', async () => {
      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        const productCards = screen.getAllByTestId('product-link');
        expect(productCards).toHaveLength(3);
      });
    });

    test('product cards have correct links', async () => {
      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        const productLinks = screen.getAllByTestId('product-link');
        expect(productLinks[0]).toHaveAttribute('href', '/dashboard/admin/product/test-product-1');
        expect(productLinks[1]).toHaveAttribute('href', '/dashboard/admin/product/test-product-2');
        expect(productLinks[2]).toHaveAttribute('href', '/dashboard/admin/product/test-product-3');
      });
    });

    test('product cards have correct styling classes', async () => {
      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        const productCards = screen.getAllByTestId('product-link');
        productCards.forEach(card => {
          expect(card).toHaveClass('product-link');
        });
      });
    });

    test('renders product images with correct src', async () => {
      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        const productImages = screen.getAllByAltText(/Test Product/);
        expect(productImages[0]).toHaveAttribute('src', '/api/v1/product/product-photo/1');
        expect(productImages[1]).toHaveAttribute('src', '/api/v1/product/product-photo/2');
        expect(productImages[2]).toHaveAttribute('src', '/api/v1/product/product-photo/3');
      });
    });

    test('product cards have correct card structure', async () => {
      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        const cards = screen.getAllByText('Test Product 1')[0].closest('.card');
        expect(cards).toHaveClass('m-2');
        expect(cards).toHaveStyle('width: 18rem');
      });
    });
  });

  describe('Layout Structure', () => {
    test('renders correct container structure', async () => {
      await act(async () => {
        renderProducts();
      });

      const container = screen.getByTestId('layout').querySelector('.row');
      expect(container).toBeInTheDocument();
      
      const adminMenuCol = container.querySelector('.col-md-3');
      const productsCol = container.querySelector('.col-md-9');
      
      expect(adminMenuCol).toBeInTheDocument();
      expect(productsCol).toBeInTheDocument();
    });

    test('renders admin menu in correct column', async () => {
      await act(async () => {
        renderProducts();
      });

      const adminMenuCol = screen.getByTestId('admin-menu').closest('.col-md-3');
      expect(adminMenuCol).toBeInTheDocument();
    });

    test('renders products in correct column', async () => {
      await act(async () => {
        renderProducts();
      });

      const productsCol = screen.getByText('All Products List').closest('.col-md-9');
      expect(productsCol).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty products list', async () => {
      axios.get.mockResolvedValue({
        data: { products: [] }
      });

      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        expect(screen.getByText('All Products List')).toBeInTheDocument();
        expect(screen.queryByTestId('product-link')).not.toBeInTheDocument();
      });
    });

    test('handles undefined products response', async () => {
      axios.get.mockResolvedValue({
        data: { products: undefined }
      });

      await act(async () => {
        renderProducts();
      });

      // Component should not crash
      expect(screen.getByText('All Products List')).toBeInTheDocument();
    });

    test('handles null products response', async () => {
      axios.get.mockResolvedValue({
        data: { products: null }
      });

      await act(async () => {
        renderProducts();
      });

      // Component should not crash
      expect(screen.getByText('All Products List')).toBeInTheDocument();
    });

    test('handles products with missing fields', async () => {
      const incompleteProducts = [
        {
          _id: '1',
          name: 'Test Product 1',
          // missing description and slug
        },
        {
          _id: '2',
          // missing name, description, and slug
        },
      ];

      axios.get.mockResolvedValue({
        data: { products: incompleteProducts }
      });

      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        // Should not crash even with missing fields
      });
    });
  });

  describe('API Integration', () => {
    test('calls correct API endpoint', async () => {
      await act(async () => {
        renderProducts();
      });

      expect(axios.get).toHaveBeenCalledWith('/api/v1/product/get-product');
    });

    test('handles API response structure correctly', async () => {
      const customResponse = {
        data: {
          products: [
            {
              _id: 'custom-1',
              name: 'Custom Product',
              description: 'Custom Description',
              slug: 'custom-product',
            }
          ]
        }
      };

      axios.get.mockResolvedValue(customResponse);

      await act(async () => {
        renderProducts();
      });

      await waitFor(() => {
        expect(screen.getByText('Custom Product')).toBeInTheDocument();
        expect(screen.getByText('Custom Description')).toBeInTheDocument();
      });
    });
  });
});

