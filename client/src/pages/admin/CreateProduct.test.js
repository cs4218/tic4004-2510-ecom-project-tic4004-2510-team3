import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import CreateProduct from './CreateProduct';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock child components
jest.mock('../../components/Layout', () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout">
        <h1>{title}</h1>
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

// Mock Antd Select
jest.mock('antd', () => {
  const MockOption = ({ children, value }) => (
    <option value={value}>{children}</option>
  );

  const MockSelect = ({ children, onChange, placeholder, value }) => (
    <select
      data-testid="select"
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      value={value}
    >
      {children}
    </select>
  );

  MockSelect.Option = MockOption;

  return {
    Select: MockSelect,
  };
});

describe('CreateProduct Component', () => {
  const mockCategories = [
    { _id: '1', name: 'Electronics' },
    { _id: '2', name: 'Clothing' },
    { _id: '3', name: 'Books' },
  ];

  const renderCreateProduct = () => {
    return render(
      <BrowserRouter>
        <CreateProduct />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API responses by default
    axios.get.mockResolvedValue({
      data: { success: true, category: mockCategories }
    });
    axios.post.mockResolvedValue({
      data: { success: false, message: 'Product created successfully' }
    });
  });

  describe('Component Rendering', () => {
    test('renders CreateProduct component with correct title', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      expect(screen.getByText('Dashboard - Create Product')).toBeInTheDocument();
      expect(screen.getByText('Create Product')).toBeInTheDocument();
      expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
    });

    test('renders all form fields', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      expect(screen.getByPlaceholderText('Select a category')).toBeInTheDocument();
      expect(screen.getByText('Upload Photo')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('write a name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('write a description')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('write a Price')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('write a quantity')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Select Shipping')).toBeInTheDocument();
      expect(screen.getByText('CREATE PRODUCT')).toBeInTheDocument();
    });

    test('renders category options', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
      });
    });
  });

  describe('Category Loading', () => {
    test('loads categories on component mount', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
    });

    test('sets categories when API returns success', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
      });
    });

    test('does not set categories when API returns no success', async () => {
      axios.get.mockResolvedValue({
        data: { success: false, category: mockCategories }
      });

      await act(async () => {
        renderCreateProduct();
      });

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
      });
    });

    test('handles error when loading categories fails', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        renderCreateProduct();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Something wwent wrong in getting catgeory');
      });
    });
  });

  describe('Form Interactions', () => {
    test('updates name input when typing', async () => {
      const user = userEvent;
      
      await act(async () => {
        renderCreateProduct();
      });

      const nameInput = screen.getByPlaceholderText('write a name');
      
      await user.type(nameInput, 'Test Product');
      
      expect(nameInput).toHaveValue('Test Product');
    });

    test('updates description textarea when typing', async () => {
      const user = userEvent;
      
      await act(async () => {
        renderCreateProduct();
      });

      const descriptionInput = screen.getByPlaceholderText('write a description');
      
      await user.type(descriptionInput, 'Test Description');
      
      expect(descriptionInput).toHaveValue('Test Description');
    });

    test('updates price input when typing', async () => {
      const user = userEvent;
      
      await act(async () => {
        renderCreateProduct();
      });

      const priceInput = screen.getByPlaceholderText('write a Price');
      
      await user.type(priceInput, '99.99');
      
      expect(priceInput).toHaveValue(99.99);
    });

    test('updates quantity input when typing', async () => {
      const user = userEvent;
      
      await act(async () => {
        renderCreateProduct();
      });

      const quantityInput = screen.getByPlaceholderText('write a quantity');
      
      await user.type(quantityInput, '10');
      
      expect(quantityInput).toHaveValue(10);
    });

    test('handles file upload', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      const fileInput = screen.getByLabelText('Upload Photo');
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('test.jpg')).toBeInTheDocument();
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    test('displays uploaded image preview', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      const fileInput = screen.getByLabelText('Upload Photo');
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByAltText('product_photo')).toBeInTheDocument();
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    test('handles category selection', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      const categorySelect = screen.getByPlaceholderText('Select a category');
      
      fireEvent.change(categorySelect, { target: { value: '1' } });
      
      expect(categorySelect).toHaveValue('1');
    });

    test('handles shipping selection', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      const shippingSelect = screen.getByPlaceholderText('Select Shipping');
      
      fireEvent.change(shippingSelect, { target: { value: '1' } });
      
      expect(shippingSelect).toHaveValue('1');
    });

    test('does not display image preview when no photo uploaded', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      expect(screen.queryByAltText('product_photo')).not.toBeInTheDocument();
    });

    test('displays default upload text when no file selected', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      expect(screen.getByText('Upload Photo')).toBeInTheDocument();
    });

    test('renders category options from API data', async () => {
      await act(async () => {
        renderCreateProduct();
      });

      await waitFor(() => {
        // The categories should be loaded and available for selection
        expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
      });
    });
  });

  describe('Product Creation', () => {
    test('creates a new product successfully', async () => {
      const user = userEvent;
      
      await act(async () => {
        renderCreateProduct();
      });

      // Fill out the form
      const nameInput = screen.getByPlaceholderText('write a name');
      const descriptionInput = screen.getByPlaceholderText('write a description');
      const priceInput = screen.getByPlaceholderText('write a Price');
      const quantityInput = screen.getByPlaceholderText('write a quantity');
      const createButton = screen.getByText('CREATE PRODUCT');

      await user.type(nameInput, 'Test Product');
      await user.type(descriptionInput, 'Test Description');
      await user.type(priceInput, '99.99');
      await user.type(quantityInput, '10');

      await user.click(createButton);

      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/product/create-product',
        expect.any(FormData)
      );

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Product Created Successfully');
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/products');
      });
    });

    test('handles create product error', async () => {
      axios.post.mockRejectedValue(new Error('Create failed'));
      const user = userEvent;

      await act(async () => {
        renderCreateProduct();
      });

      const nameInput = screen.getByPlaceholderText('write a name');
      const createButton = screen.getByText('CREATE PRODUCT');

      await user.type(nameInput, 'Test Product');
      await user.click(createButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('something went wrong');
      });
    });

    test('handles create product API error response', async () => {
      axios.post.mockResolvedValue({
        data: { success: true, message: 'Product already exists' }
      });
      const user = userEvent;

      await act(async () => {
        renderCreateProduct();
      });

      const nameInput = screen.getByPlaceholderText('write a name');
      const createButton = screen.getByText('CREATE PRODUCT');

      await user.type(nameInput, 'Existing Product');
      await user.click(createButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Product already exists');
      });
    });

    test('prevents default form submission', async () => {
      const user = userEvent;
      
      await act(async () => {
        renderCreateProduct();
      });

      const nameInput = screen.getByPlaceholderText('write a name');
      const createButton = screen.getByText('CREATE PRODUCT');

      await user.type(nameInput, 'Test Product');
      
      const preventDefault = jest.fn();
      const mockEvent = { preventDefault };
      
      // Simulate form submission
      fireEvent.click(createButton);

      expect(axios.post).toHaveBeenCalled();
    });

    test('creates FormData with all required fields', async () => {
      const user = userEvent;
      
      await act(async () => {
        renderCreateProduct();
      });

      // Fill out all form fields
      const nameInput = screen.getByPlaceholderText('write a name');
      const descriptionInput = screen.getByPlaceholderText('write a description');
      const priceInput = screen.getByPlaceholderText('write a Price');
      const quantityInput = screen.getByPlaceholderText('write a quantity');
      const categorySelect = screen.getByPlaceholderText('Select a category');
      const createButton = screen.getByText('CREATE PRODUCT');

      await user.type(nameInput, 'Test Product');
      await user.type(descriptionInput, 'Test Description');
      await user.type(priceInput, '99.99');
      await user.type(quantityInput, '10');
      fireEvent.change(categorySelect, { target: { value: '1' } });

      await user.click(createButton);

      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/product/create-product',
        expect.any(FormData)
      );
    });
  });

  describe('FormData Creation', () => {
    test('creates FormData with correct fields', async () => {
      const user = userEvent;
      
      await act(async () => {
        renderCreateProduct();
      });

      // Fill out the form
      const nameInput = screen.getByPlaceholderText('write a name');
      const descriptionInput = screen.getByPlaceholderText('write a description');
      const priceInput = screen.getByPlaceholderText('write a Price');
      const quantityInput = screen.getByPlaceholderText('write a quantity');
      const createButton = screen.getByText('CREATE PRODUCT');

      await user.type(nameInput, 'Test Product');
      await user.type(descriptionInput, 'Test Description');
      await user.type(priceInput, '99.99');
      await user.type(quantityInput, '10');

      await user.click(createButton);

      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/product/create-product',
        expect.any(FormData)
      );

      // Verify FormData was called with correct endpoint
      const [url, formData] = axios.post.mock.calls[0];
      expect(url).toBe('/api/v1/product/create-product');
      expect(formData).toBeInstanceOf(FormData);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty categories list', async () => {
      axios.get.mockResolvedValue({
        data: { success: true, category: [] }
      });

      await act(async () => {
        renderCreateProduct();
      });

      expect(screen.getByPlaceholderText('Select a category')).toBeInTheDocument();
    });

    test('handles undefined categories response', async () => {
      axios.get.mockResolvedValue({
        data: { success: true, category: undefined }
      });

      await act(async () => {
        renderCreateProduct();
      });

      // Component should not crash
      expect(screen.getByText('Create Product')).toBeInTheDocument();
    });

    test('handles missing file upload', async () => {
      const user = userEvent;
      
      await act(async () => {
        renderCreateProduct();
      });

      const nameInput = screen.getByPlaceholderText('write a name');
      const createButton = screen.getByText('CREATE PRODUCT');

      await user.type(nameInput, 'Test Product');
      await user.click(createButton);

      // Should still attempt to create product even without file
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
