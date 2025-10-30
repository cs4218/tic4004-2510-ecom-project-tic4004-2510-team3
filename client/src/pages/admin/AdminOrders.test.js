import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import moment from 'moment';
import { Select } from 'antd'; // Import Antd components used in the component
import AdminOrders from './AdminOrders';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../../components/Layout', () => ({ children, title }) => (
  <div data-testid="layout" data-title={title}>{children}</div>
));
jest.mock('../../components/AdminMenu', () => () => (
  <div data-testid="admin-menu">AdminMenu</div>
));

// Mock Antd Select and Option to allow testing onChange and default value
// Note: This is crucial as the component uses the Antd Select component.
jest.mock('antd', () => ({
  Select: ({ children, onChange, defaultValue }) => (
    <select
      data-testid="status-select"
      onChange={(e) => onChange(e.target.value)}
      defaultValue={defaultValue}
    >
      {children}
    </select>
  ),
  Option: ({ children, value }) => (
    <option value={value}>{children}</option>
  ),
}));


const mockOrders = [
  {
    _id: 'order123',
    status: 'Not Process',
    buyer: { name: 'Alice' },
    createAt: moment().subtract(1, 'day').toISOString(),
    payment: { success: true },
    products: [{ _id: 'prod1', name: 'Laptop', price: 1000 }],
  },
  {
    _id: 'order456',
    status: 'Shipped',
    buyer: { name: 'Bob' },
    createAt: moment().subtract(5, 'days').toISOString(),
    payment: { success: false },
    products: [{ _id: 'prod2', name: 'Mouse', price: 50 }, { _id: 'prod3', name: 'Keyboard', price: 75 }],
  },
];

describe('AdminOrders Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for useAuth, allowing API calls to proceed
    require('../../context/auth').useAuth.mockReturnValue([
      { token: 'mock-token' },
      jest.fn(),
    ]);
    // Mock the product photo API call
    axios.get.mockImplementation((url) => {
        if (url === '/api/v1/auth/all-orders') {
            return Promise.resolve({ data: mockOrders });
        }
        // Mock product photo API to avoid console errors/warnings during rendering
        if (url.startsWith('/api/v1/product/product-photo/')) {
            return Promise.resolve({ data: 'mock-image-data' }); 
        }
        return Promise.reject(new Error('not mocked'));
    });
  });

  // ---

  // ================== OUTPUT-BASED TESTING ==================
  // Verifying the component renders the correct structure and data.
  
  describe('Output-Based Tests', () => {

    test('should render layout with correct title and admin menu', async () => {
      render(<AdminOrders />);
      
      expect(screen.getByTestId('layout')).toHaveAttribute('data-title', 'All Orders Data');
      expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
      expect(screen.getByText('All Orders')).toBeInTheDocument();
    });

    test('should render all orders data in the table', async () => {
      render(<AdminOrders />);
      
      await waitFor(() => {
        // Check for order-specific data
        expect(screen.getByText('Alice')).toBeInTheDocument(); // Buyer 1 Name
        expect(screen.getByText('Bob')).toBeInTheDocument();   // Buyer 2 Name
        
        // Check initial status is displayed correctly
        const selects = screen.getAllByTestId('status-select');
        expect(selects[0]).toHaveValue('Not Process');
        expect(selects[1]).toHaveValue('Shipped');

        // Check product quantities
        const quantityCells = screen.getAllByRole('cell', { name: /Quantity/i }).map(td => td.textContent);
        // The header 'Quantity' is also included, so check the next two elements
        expect(quantityCells[1]).toBe('1'); 
        expect(quantityCells[2]).toBe('2');
      });
    });

    test('should display product details for each order', async () => {
      render(<AdminOrders />);
      
      await waitFor(() => {
        // Check product names
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('Mouse')).toBeInTheDocument();
        expect(screen.getByText('Keyboard')).toBeInTheDocument();
        
        // Check payment status
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
    });
  });

  // ---

  // ================== COMMUNICATION TESTING ==================
  // Verifying correct API calls are made based on component lifecycle and user interaction.

  describe('Communication Tests', () => {

    test('should call getOrders API on component mount if auth token exists', async () => {
      axios.get.mockClear(); // Clear mock calls before render
      render(<AdminOrders />);
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders');
      });
    });
    
    test('should not call getOrders API if auth token is missing', () => {
      // Mock auth to be empty
      require('../../context/auth').useAuth.mockReturnValue([
        { token: null },
        jest.fn(),
      ]);
      axios.get.mockClear();
      render(<AdminOrders />);
      
      // The API should not be called without waiting, as there's no useEffect dependency change
      expect(axios.get).not.toHaveBeenCalledWith('/api/v1/auth/all-orders');
    });

    test('should call update order status API and refetch orders on status change', async () => {
      // Mock getOrders API resolve, and set up a new mock for it to track refetch
      const getOrdersMock = axios.get.mockResolvedValue({ data: mockOrders });
      // Mock the put/update API call
      axios.put.mockResolvedValue({ data: { ok: true } });
      
      render(<AdminOrders />);
      
      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(getOrdersMock).toHaveBeenCalledTimes(1);
      });
      
      // Find the select for the first order
      const selectElement = screen.getAllByTestId('status-select')[0];
      
      // Simulate changing the status to 'Processing'
      fireEvent.change(selectElement, { target: { value: 'Processing' } });
      
      await waitFor(() => {
        // 1. Check if the PUT API was called correctly
        expect(axios.put).toHaveBeenCalledWith(
          '/api/v1/auth/order-status/order123',
          { status: 'Processing' }
        );
        // 2. Check if getOrders was called a second time (refetch)
        expect(getOrdersMock).toHaveBeenCalledTimes(2);
      });
    });

    test('should handle error when updating order status fails', async () => {
      // Mock getOrders to succeed initially
      const getOrdersMock = axios.get.mockResolvedValue({ data: mockOrders });
      // Mock the put/update API call to reject
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      axios.put.mockRejectedValue(new Error('Update failed'));

      render(<AdminOrders />);

      await waitFor(() => {
        expect(getOrdersMock).toHaveBeenCalledTimes(1);
      });

      const selectElement = screen.getAllByTestId('status-select')[0];
      
      fireEvent.change(selectElement, { target: { value: 'Processing' } });

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(new Error('Update failed'));
      });
      
      // Ensure refetch is still attempted (as it's called in the try block *before* the potential error handling)
      // NOTE: In this code, getOrders() is called *outside* the try block, so it is always called.
      // However, since the provided code calls getOrders *inside* the try block, a put failure would prevent a refetch.
      // Based on the provided code:
      // try {
      //   const { data } = await axios.put(...)
      //   getOrders(); // This runs only on success
      // } catch (error) { ... }
      expect(getOrdersMock).toHaveBeenCalledTimes(1); // Refetch should NOT be called on failure

      consoleLogSpy.mockRestore();
    });
  });
});