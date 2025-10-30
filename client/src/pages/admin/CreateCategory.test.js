import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateCategory from './CreateCategory';
import axios from 'axios';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('./../../components/Layout', () => ({ children, title }) => (
  <div data-testid="layout" data-title={title}>{children}</div>
));
jest.mock('./../../components/AdminMenu', () => () => (
  <div data-testid="admin-menu">AdminMenu</div>
));
jest.mock('../../components/Form/CategoryForm', () => ({ handleSubmit, value, setValue }) => (
  <form onSubmit={handleSubmit} data-testid="category-form">
    <input
      data-testid="category-input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
    <button type="submit">Submit</button>
  </form>
));
jest.mock('antd', () => ({
  Modal: ({ children, visible, onCancel, footer }) => 
    visible ? (
      <div data-testid="modal">
        <button data-testid="modal-cancel" onClick={onCancel}>Cancel</button>
        {children}
      </div>
    ) : null
}));

describe('CreateCategory Component', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================== OUTPUT-BASED TESTING ==================
  // Testing rendered output based on component state
  
  describe('Output-Based Tests - Initial Render', () => {
    
    test('should render layout with correct title', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      
      render(<CreateCategory />);
      
      const layout = screen.getByTestId('layout');
      expect(layout).toHaveAttribute('data-title', 'Dashboard - Create Category');
    });

    test('should render admin menu', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      
      render(<CreateCategory />);
      
      expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
    });

    test('should render "Manage Category" heading', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      
      render(<CreateCategory />);
      
      expect(screen.getByText('Manage Category')).toBeInTheDocument();
    });

    test('should render category form for creating new category', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      
      render(<CreateCategory />);
      
      expect(screen.getByTestId('category-form')).toBeInTheDocument();
    });

    test('should render empty table when no categories exist', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
      });
    });

    test('should render categories in table when categories exist', async () => {
      const mockCategories = [
        { _id: '1', name: 'Electronics' },
        { _id: '2', name: 'Clothing' }
      ];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        expect(screen.getByText('Electronics')).toBeInTheDocument();
        expect(screen.getByText('Clothing')).toBeInTheDocument();
      });
    });

    test('should render Edit and Delete buttons for each category', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        const deleteButtons = screen.getAllByText('Delete');
        expect(editButtons).toHaveLength(1);
        expect(deleteButtons).toHaveLength(1);
      });
    });

    test('should not render modal initially', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      
      render(<CreateCategory />);
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  // ================== COMBINATIONAL TESTING ==================
  // Testing different combinations of inputs and states
  
  describe('Combinational Tests - Different Scenarios', () => {
    
    test('should handle successful category creation with valid name', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      axios.post.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      const input = screen.getAllByTestId('category-input')[0];
      const form = screen.getAllByTestId('category-form')[0];
      
      fireEvent.change(input, { target: { value: 'Books' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Books is created');
      });
    });

    test('should handle failed category creation with error message', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      axios.post.mockResolvedValue({ data: { success: false, message: 'Category already exists' } });
      
      render(<CreateCategory />);
      
      const input = screen.getAllByTestId('category-input')[0];
      const form = screen.getAllByTestId('category-form')[0];
      
      fireEvent.change(input, { target: { value: 'Books' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Category already exists');
      });
    });

    test('should handle network error during category creation', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      axios.post.mockRejectedValue(new Error('Network error'));
      
      render(<CreateCategory />);
      
      const input = screen.getAllByTestId('category-input')[0];
      const form = screen.getAllByTestId('category-form')[0];
      
      fireEvent.change(input, { target: { value: 'Books' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('somthing went wrong in input form');
      });
    });

    test('should handle successful category update', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      axios.put.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
      });
      
      const modalInput = screen.getAllByTestId('category-input')[1];
      const modalForm = screen.getAllByTestId('category-form')[1];
      
      fireEvent.change(modalInput, { target: { value: 'Updated Electronics' } });
      fireEvent.submit(modalForm);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Updated Electronics is updated');
      });
    });

    test('should handle failed category update', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      axios.put.mockResolvedValue({ data: { success: false, message: 'Update failed' } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
      });
      
      const modalForm = screen.getAllByTestId('category-form')[1];
      fireEvent.submit(modalForm);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Update failed');
      });
    });

    test('should handle successful category deletion', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      axios.delete.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
      });
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('category is deleted');
      });
    });

    test('should handle failed category deletion', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      axios.delete.mockResolvedValue({ data: { success: false, message: 'Cannot delete' } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
      });
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Cannot delete');
      });
    });

    test('should handle error when fetching categories fails', async () => {
      axios.get.mockRejectedValue(new Error('Fetch error'));
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Something wwent wrong in getting catgeory');
      });
    });
  });

  // ================== STATE-BASED TESTING ==================
  // Testing component state changes and effects
  
  describe('State-Based Tests - State Management', () => {
    
    test('should update name state when typing in create form', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      
      render(<CreateCategory />);
      
      const input = screen.getAllByTestId('category-input')[0];
      
      fireEvent.change(input, { target: { value: 'New Category' } });
      
      expect(input.value).toBe('New Category');
    });

    test('should open modal and set selected category when Edit is clicked', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
      });
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      const modalInput = screen.getAllByTestId('category-input')[1];
      expect(modalInput.value).toBe('Electronics');
    });

    test('should close modal when cancel button is clicked', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
      });
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      
      const cancelButton = screen.getByTestId('modal-cancel');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    test('should close modal and reset state after successful update', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      axios.put.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
      });
      
      const modalForm = screen.getAllByTestId('category-form')[1];
      fireEvent.submit(modalForm);
      
      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });

    test('should update updatedName state when typing in modal form', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
      });
      
      const modalInput = screen.getAllByTestId('category-input')[1];
      fireEvent.change(modalInput, { target: { value: 'Modified Name' } });
      
      expect(modalInput.value).toBe('Modified Name');
    });

    test('should refetch categories after successful creation', async () => {
      axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
      axios.post.mockResolvedValue({ data: { success: true } });
      axios.get.mockResolvedValueOnce({ 
        data: { success: true, category: [{ _id: '1', name: 'Books' }] } 
      });
      
      render(<CreateCategory />);
      
      const input = screen.getAllByTestId('category-input')[0];
      const form = screen.getAllByTestId('category-form')[0];
      
      fireEvent.change(input, { target: { value: 'Books' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
      });
    });

    test('should refetch categories after successful deletion', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } });
      axios.delete.mockResolvedValue({ data: { success: true } });
      axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
      });
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ================== COMMUNICATION TESTING ==================
  // Testing API calls and component interactions
  
  describe('Communication Tests - API Interactions', () => {
    
    test('should call getAllCategory on component mount', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
      });
    });

    test('should call create category API with correct payload', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      axios.post.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      const input = screen.getAllByTestId('category-input')[0];
      const form = screen.getAllByTestId('category-form')[0];
      
      fireEvent.change(input, { target: { value: 'Books' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          '/api/v1/category/create-category',
          { name: 'Books' }
        );
      });
    });

    test('should call update category API with correct payload and ID', async () => {
      const mockCategories = [{ _id: '123', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      axios.put.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
      });
      
      const modalInput = screen.getAllByTestId('category-input')[1];
      const modalForm = screen.getAllByTestId('category-form')[1];
      
      fireEvent.change(modalInput, { target: { value: 'Updated' } });
      fireEvent.submit(modalForm);
      
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          '/api/v1/category/update-category/123',
          { name: 'Updated' }
        );
      });
    });

    test('should call delete category API with correct ID', async () => {
      const mockCategories = [{ _id: '456', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      axios.delete.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
      });
      
      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith('/api/v1/category/delete-category/456');
      });
    });

    test('should show success toast after successful creation', async () => {
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      axios.post.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      const input = screen.getAllByTestId('category-input')[0];
      const form = screen.getAllByTestId('category-form')[0];
      
      fireEvent.change(input, { target: { value: 'Toys' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Toys is created');
        expect(toast.success).toHaveBeenCalledTimes(1);
      });
    });

    test('should show success toast after successful update', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      axios.put.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
      });
      
      const modalInput = screen.getAllByTestId('category-input')[1];
      const modalForm = screen.getAllByTestId('category-form')[1];
      
      fireEvent.change(modalInput, { target: { value: 'NewName' } });
      fireEvent.submit(modalForm);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('NewName is updated');
      });
    });

    test('should show success toast after successful deletion', async () => {
      const mockCategories = [{ _id: '1', name: 'Electronics' }];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      axios.delete.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
      });
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('category is deleted');
      });
    });

    test('should log error to console when creation fails', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const error = new Error('Network error');
      
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      axios.post.mockRejectedValue(error);
      
      render(<CreateCategory />);
      
      const input = screen.getAllByTestId('category-input')[0];
      const form = screen.getAllByTestId('category-form')[0];
      
      fireEvent.change(input, { target: { value: 'Books' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(error);
      });
      
      consoleLogSpy.mockRestore();
    });

    test('should handle multiple rapid delete requests', async () => {
      const mockCategories = [
        { _id: '1', name: 'Electronics' },
        { _id: '2', name: 'Clothing' }
      ];
      axios.get.mockResolvedValue({ data: { success: true, category: mockCategories } });
      axios.delete.mockResolvedValue({ data: { success: true } });
      
      render(<CreateCategory />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
        fireEvent.click(deleteButtons[1]);
      });
      
      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledTimes(2);
      });
    });
  });
});