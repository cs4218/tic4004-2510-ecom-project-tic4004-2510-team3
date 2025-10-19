import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import toast from 'react-hot-toast';
import CreateCategory from './CreateCategory';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
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

jest.mock('../../components/Form/CategoryForm', () => {
  return function MockCategoryForm({ handleSubmit, value, setValue }) {
    return (
      <form onSubmit={handleSubmit} data-testid="category-form">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter new category"
          data-testid="category-input"
        />
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </form>
    );
  };
});

// Mock Antd Modal
jest.mock('antd', () => ({
  Modal: ({ children, visible, onCancel, footer }) => {
    if (!visible) return null;
    return (
      <div data-testid="modal">
        <button onClick={onCancel} data-testid="modal-cancel">Cancel</button>
        {children}
        {footer}
      </div>
    );
  },
}));

describe('CreateCategory Component', () => {
  const mockCategories = [
    { _id: '1', name: 'Electronics' },
    { _id: '2', name: 'Clothing' },
    { _id: '3', name: 'Books' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API responses by default
    axios.get.mockResolvedValue({
      data: { success: true, category: mockCategories }
    });
    axios.post.mockResolvedValue({
      data: { success: true, message: 'Category created successfully' }
    });
    axios.put.mockResolvedValue({
      data: { success: true, message: 'Category updated successfully' }
    });
    axios.delete.mockResolvedValue({
      data: { success: true, message: 'Category deleted successfully' }
    });
  });

  describe('Component Rendering', () => {
    test('renders CreateCategory component with correct title', async () => {
      await act(async () => {
        render(<CreateCategory />);
      });

      expect(screen.getByText('Dashboard - Create Category')).toBeInTheDocument();
      expect(screen.getByText('Manage Category')).toBeInTheDocument();
      expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
    });

    test('renders category form', async () => {
      await act(async () => {
        render(<CreateCategory />);
      });

      expect(screen.getByTestId('category-form')).toBeInTheDocument();
      expect(screen.getByTestId('category-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    test('renders categories table with headers', async () => {
      await act(async () => {
        render(<CreateCategory />);
      });

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Category Loading', () => {
    test('loads and displays categories on component mount', async () => {
      await act(async () => {
        render(<CreateCategory />);
      });

      expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
      
      await waitFor(() => {
        expect(screen.getByText('Electronics')).toBeInTheDocument();
        expect(screen.getByText('Clothing')).toBeInTheDocument();
        expect(screen.getByText('Books')).toBeInTheDocument();
      });
    });

    test('handles error when loading categories fails', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Something wwent wrong in getting catgeory');
      });
    });
  });

  describe('Create Category', () => {
    test('creates a new category successfully', async () => {
      const user = userEvent;
      
      await act(async () => {
        render(<CreateCategory />);
      });

      const categoryInput = screen.getByTestId('category-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(categoryInput, 'New Category');
      await user.click(submitButton);

      expect(axios.post).toHaveBeenCalledWith('/api/v1/category/create-category', {
        name: 'New Category'
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('New Category is created');
        expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + refresh after create
      });
    });

    test('handles create category error', async () => {
      axios.post.mockRejectedValue(new Error('Create failed'));
      const user = userEvent;

      await act(async () => {
        render(<CreateCategory />);
      });

      const categoryInput = screen.getByTestId('category-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(categoryInput, 'New Category');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('somthing went wrong in input form');
      });
    });

    test('handles create category API error response', async () => {
      axios.post.mockResolvedValue({
        data: { success: false, message: 'Category already exists' }
      });
      const user = userEvent;

      await act(async () => {
        render(<CreateCategory />);
      });

      const categoryInput = screen.getByTestId('category-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(categoryInput, 'Existing Category');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Category already exists');
      });
    });
  });

  describe('Update Category', () => {
    test('opens modal when edit button is clicked', async () => {
      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    test('updates category successfully', async () => {
      const user = userEvent;
      
      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
      });

      const modalInputs = screen.getAllByTestId('category-input');
      const modalInput = modalInputs.find(input => input.value === 'Electronics');
      const modalSubmitButtons = screen.getAllByTestId('submit-button');
      const modalSubmitButton = modalSubmitButtons[1]; // Second button is in modal

      await user.clear(modalInput);
      await user.type(modalInput, 'Updated Electronics');
      await user.click(modalSubmitButton);

      expect(axios.put).toHaveBeenCalledWith('/api/v1/category/update-category/1', {
        name: 'Updated Electronics'
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Updated Electronics is updated');
        expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + refresh after update
      });
    });

    test('handles update category error', async () => {
      axios.put.mockRejectedValue(new Error('Update failed'));
      const user = userEvent;

      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
      });

      const modalInputs = screen.getAllByTestId('category-input');
      const modalInput = modalInputs.find(input => input.value === 'Electronics');
      const modalSubmitButtons = screen.getAllByTestId('submit-button');
      const modalSubmitButton = modalSubmitButtons[1]; // Second button is in modal

      await user.clear(modalInput);
      await user.type(modalInput, 'Updated Category');
      await user.click(modalSubmitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Somtihing went wrong');
      });
    });

    test('closes modal when cancel is clicked', async () => {
      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      const cancelButton = screen.getByTestId('modal-cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  describe('Delete Category', () => {
    test('deletes category successfully', async () => {
      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      expect(axios.delete).toHaveBeenCalledWith('/api/v1/category/delete-category/1');

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('category is deleted');
        expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + refresh after delete
      });
    });

    test('handles delete category error', async () => {
      axios.delete.mockRejectedValue(new Error('Delete failed'));

      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Somtihing went wrong');
      });
    });

    test('handles delete category API error response', async () => {
      axios.delete.mockResolvedValue({
        data: { success: false, message: 'Cannot delete category with products' }
      });

      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Cannot delete category with products');
      });
    });
  });

  describe('Form Interactions', () => {
    test('updates input value when typing', async () => {
      const user = userEvent;
      
      await act(async () => {
        render(<CreateCategory />);
      });

      const categoryInput = screen.getByTestId('category-input');
      
      await user.type(categoryInput, 'Test Category');
      
      expect(categoryInput).toHaveValue('Test Category');
    });

    test('clears form after successful submission', async () => {
      const user = userEvent;
      
      await act(async () => {
        render(<CreateCategory />);
      });

      const categoryInput = screen.getByTestId('category-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(categoryInput, 'New Category');
      await user.click(submitButton);

      await waitFor(() => {
        expect(categoryInput).toHaveValue('');
      });
    });
  });

  describe('Modal State Management', () => {
    test('sets correct category data when opening edit modal', async () => {
      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
      });

      const modalInputs = screen.getAllByTestId('category-input');
      const modalInput = modalInputs.find(input => input.value === 'Electronics');
      expect(modalInput).toHaveValue('Electronics');
    });

    test('resets modal state after successful update', async () => {
      const user = userEvent;
      
      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
      });

      const modalInputs = screen.getAllByTestId('category-input');
      const modalInput = modalInputs.find(input => input.value === 'Electronics');
      const modalSubmitButtons = screen.getAllByTestId('submit-button');
      const modalSubmitButton = modalSubmitButtons[1]; // Second button is in modal

      await user.clear(modalInput);
      await user.type(modalInput, 'Updated Category');
      await user.click(modalSubmitButton);

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty categories list', async () => {
      axios.get.mockResolvedValue({
        data: { success: true, category: [] }
      });

      await act(async () => {
        render(<CreateCategory />);
      });

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
        // Should not have any category rows
        expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
      });
    });

    test('handles undefined categories response', async () => {
      axios.get.mockResolvedValue({
        data: { success: true, category: undefined }
      });

      await act(async () => {
        render(<CreateCategory />);
      });

      // Component should not crash
      expect(screen.getByText('Manage Category')).toBeInTheDocument();
    });
  });
});
