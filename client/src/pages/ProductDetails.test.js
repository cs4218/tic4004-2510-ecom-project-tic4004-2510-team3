import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import ProductDetails from './ProductDetails';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
}));

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockParams = { slug: 'test-product-slug' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

// Mock Layout component
jest.mock('../components/Layout', () => {
  return function MockLayout({ children }) {
    return (
      <div data-testid="layout">
        {children}
      </div>
    );
  };
});

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ProductDetails Component', () => {
  const mockProduct = {
    _id: 'product1',
    name: 'Test Product',
    description: 'This is a test product description',
    price: 99.99,
    slug: 'test-product-slug',
    category: {
      _id: 'cat1',
      name: 'Electronics'
    }
  };

  const mockRelatedProducts = [
    {
      _id: 'product2',
      name: 'Related Product 1',
      description: 'This is a related product description 1',
      price: 79.99,
      slug: 'related-product-1'
    },
    {
      _id: 'product3',
      name: 'Related Product 2',
      description: 'This is related product description 2',
      price: 129.99,
      slug: 'related-product-2'
    }
  ];

  const renderProductDetails = () => {
    return render(
      <MemoryRouter initialEntries={['/product/test-product-slug']}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API
    axios.get
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          product: mockProduct
        }
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          products: mockRelatedProducts
        }
      }));
  });

  // Test for Component renders
  test('renders ProductDetails component with correctly', async () => {
    axios.get
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          product: mockProduct
        }
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          products: mockRelatedProducts
        }
      }));
    
    await act(async () => {
      renderProductDetails();
    });
    
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('Product Details')).toBeInTheDocument();
    expect(screen.getByText(/Similar Products/i)).toBeInTheDocument();
    expect(screen.getByText('ADD TO CART')).toBeInTheDocument();
  });

  // Test for fetches and displays product data
  test('fetches and displays product information correctly', async () => {
    axios.get
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          product: mockProduct
        }
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          products: mockRelatedProducts
        }
      }));
    
    await act(async () => {
      renderProductDetails();
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/product/get-product/test-product-slug');
      expect(screen.getByText(`Name : ${mockProduct.name}`)).toBeInTheDocument();
      expect(screen.getByText(`Description : ${mockProduct.description}`)).toBeInTheDocument();
      expect(screen.getByText(`Category : ${mockProduct.category.name}`)).toBeInTheDocument();
      const productDetailsSection = screen.getByText(`Name : ${mockProduct.name}`).closest('.product-details-info');
      expect(productDetailsSection).toBeInTheDocument();
      expect(productDetailsSection.textContent).toContain('$99.99');
    });
  });

  // Test for displays product image
  test('renders product image with correctly', async () => {
    axios.get
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          product: mockProduct
        }
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          products: mockRelatedProducts
        }
      }));
    
    await act(async () => {
      renderProductDetails();
    });
    
    await waitFor(() => {
      const productImage = screen.getByAltText(mockProduct.name);
      expect(productImage).toBeInTheDocument();
      expect(productImage).toHaveAttribute('src', `/api/v1/product/product-photo/${mockProduct._id}`);
      expect(productImage).toHaveAttribute('height', '300');
      expect(productImage).toHaveAttribute('width', '350px');
    });
  });

  // Test for displays related products
  test('displays related products', async () => {
    axios.get
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          product: mockProduct
        }
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          products: mockRelatedProducts
        }
      }));
    
    await act(async () => {
      renderProductDetails();
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/product/related-product/product1/cat1');
      expect(screen.getByText('Related Product 1')).toBeInTheDocument();
      expect(screen.getByText('Related Product 2')).toBeInTheDocument();
      expect(screen.getByText('$79.99')).toBeInTheDocument();
      expect(screen.getByText('$129.99')).toBeInTheDocument();
    });
  });

  // Tests for Handles related products
  test('navigates to related product details when "More Details" is clicked', async () => {
    axios.get
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          product: mockProduct
        }
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          products: mockRelatedProducts
        }
      }));
    
    await act(async () => {
      renderProductDetails();
    });
    
    await waitFor(() => {
      const moreDetailsButtons = screen.getAllByText('More Details');
      expect(moreDetailsButtons).toHaveLength(mockRelatedProducts.length);
    });
    
    const firstMoreDetailsButton = screen.getAllByText('More Details')[0];
    fireEvent.click(firstMoreDetailsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(`/product/${mockRelatedProducts[0].slug}`);
  });

  // Test for Handles missing product data
  test('handles empty or null product data gracefully', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: { product: null }
    }));
    
    await act(async () => {
      renderProductDetails();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Product Details')).toBeInTheDocument();
    });
  });

  // Test that related products fetch is called with correct parameters
  test('fetches related products with correct product and category IDs', async () => {
    axios.get
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          product: mockProduct
        }
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          products: mockRelatedProducts
        }
      }));
    
    await act(async () => {
      renderProductDetails();
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`
      );
    });
  });
});
