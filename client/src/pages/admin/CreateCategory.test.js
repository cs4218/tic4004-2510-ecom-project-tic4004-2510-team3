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
});