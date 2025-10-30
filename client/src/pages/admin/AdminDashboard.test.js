import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../../context/auth';

// Mock dependencies
jest.mock('../../context/auth');
jest.mock('./../../components/Layout', () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));
jest.mock('../../components/AdminMenu', () => () => (
  <div data-testid="admin-menu">AdminMenu</div>
));

describe('AdminDashboard Component', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================== OUTPUT-BASED TESTING ==================
  // Testing rendered output based on different auth states
  
  describe('Output-Based Tests - Rendered Output', () => {
    
    test('should render layout component', () => {
      useAuth.mockReturnValue([{}]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    test('should render admin menu', () => {
      useAuth.mockReturnValue([{}]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
    });

    test('should render card with admin information', () => {
      useAuth.mockReturnValue([{ user: { name: 'John', email: 'john@test.com', phone: '1234567890' } }]);
      
      const { container } = render(<AdminDashboard />);
      
      const card = container.querySelector('.card.w-75.p-3');
      expect(card).toBeInTheDocument();
    });

    test('should render three heading elements for admin details', () => {
      useAuth.mockReturnValue([{ user: { name: 'John', email: 'john@test.com', phone: '1234567890' } }]);
      
      render(<AdminDashboard />);
      
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
    });

    test('should render admin name with correct label', () => {
      useAuth.mockReturnValue([{ user: { name: 'John Doe', email: 'john@test.com', phone: '1234567890' } }]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Admin Name :/)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    test('should render admin email with correct label', () => {
      useAuth.mockReturnValue([{ user: { name: 'John', email: 'admin@example.com', phone: '1234567890' } }]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Admin Email :/)).toBeInTheDocument();
      expect(screen.getByText(/admin@example.com/)).toBeInTheDocument();
    });

    test('should render admin contact with correct label', () => {
      useAuth.mockReturnValue([{ user: { name: 'John', email: 'john@test.com', phone: '9876543210' } }]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Admin Contact :/)).toBeInTheDocument();
      expect(screen.getByText(/9876543210/)).toBeInTheDocument();
    });

    test('should render correct layout structure with Bootstrap grid', () => {
      useAuth.mockReturnValue([{ user: { name: 'John', email: 'john@test.com', phone: '1234567890' } }]);
      
      const { container } = render(<AdminDashboard />);
      
      const row = container.querySelector('.row');
      expect(row).toBeInTheDocument();
      
      const leftColumn = container.querySelector('.col-md-3');
      const rightColumn = container.querySelector('.col-md-9');
      expect(leftColumn).toBeInTheDocument();
      expect(rightColumn).toBeInTheDocument();
    });

    test('should render admin menu in left column and info card in right column', () => {
      useAuth.mockReturnValue([{ user: { name: 'John', email: 'john@test.com', phone: '1234567890' } }]);
      
      const { container } = render(<AdminDashboard />);
      
      const leftColumn = container.querySelector('.col-md-3');
      const rightColumn = container.querySelector('.col-md-9');
      
      expect(leftColumn).toContainElement(screen.getByTestId('admin-menu'));
      expect(rightColumn).toContainElement(container.querySelector('.card'));
    });

    test('should display information in consistent order: name, email, contact', () => {
      useAuth.mockReturnValue([{ user: { name: 'Admin', email: 'admin@test.com', phone: '123' } }]);
      
      render(<AdminDashboard />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveTextContent(/Admin Name/);
      expect(headings[1]).toHaveTextContent(/Admin Email/);
      expect(headings[2]).toHaveTextContent(/Admin Contact/);
    });
  });

  // ================== COMBINATIONAL TESTING ==================
  // Testing different combinations of auth data
  
  describe('Combinational Tests - Different Auth Data Combinations', () => {
    
    test('should display complete admin information when all fields are present', () => {
      const mockAuth = {
        user: {
          name: 'Alice Johnson',
          email: 'alice@admin.com',
          phone: '5551234567'
        }
      };
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Alice Johnson/)).toBeInTheDocument();
      expect(screen.getByText(/alice@admin.com/)).toBeInTheDocument();
      expect(screen.getByText(/5551234567/)).toBeInTheDocument();
    });

    test('should handle auth with undefined user object', () => {
      useAuth.mockReturnValue([{}]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Admin Name :/)).toBeInTheDocument();
      expect(screen.getByText(/Admin Email :/)).toBeInTheDocument();
      expect(screen.getByText(/Admin Contact :/)).toBeInTheDocument();
    });

    test('should handle auth with null user', () => {
      useAuth.mockReturnValue([{ user: null }]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
    });

    test('should handle auth with partial user data - missing name', () => {
      const mockAuth = {
        user: {
          email: 'test@admin.com',
          phone: '1234567890'
        }
      };
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Admin Name :/)).toBeInTheDocument();
      expect(screen.getByText(/test@admin.com/)).toBeInTheDocument();
      expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    });

    test('should handle auth with partial user data - missing email', () => {
      const mockAuth = {
        user: {
          name: 'Bob Smith',
          phone: '9876543210'
        }
      };
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Bob Smith/)).toBeInTheDocument();
      expect(screen.getByText(/Admin Email :/)).toBeInTheDocument();
      expect(screen.getByText(/9876543210/)).toBeInTheDocument();
    });

    test('should handle auth with partial user data - missing phone', () => {
      const mockAuth = {
        user: {
          name: 'Charlie Brown',
          email: 'charlie@admin.com'
        }
      };
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Charlie Brown/)).toBeInTheDocument();
      expect(screen.getByText(/charlie@admin.com/)).toBeInTheDocument();
      expect(screen.getByText(/Admin Contact :/)).toBeInTheDocument();
    });

    test('should handle empty string values in user data', () => {
      const mockAuth = {
        user: {
          name: '',
          email: '',
          phone: ''
        }
      };
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Admin Name :/)).toBeInTheDocument();
      expect(screen.getByText(/Admin Email :/)).toBeInTheDocument();
      expect(screen.getByText(/Admin Contact :/)).toBeInTheDocument();
    });

    test('should handle special characters in admin data', () => {
      const mockAuth = {
        user: {
          name: "O'Brien-Smith",
          email: 'test+admin@example.com',
          phone: '+1-555-123-4567'
        }
      };
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/O'Brien-Smith/)).toBeInTheDocument();
      expect(screen.getByText(/test\+admin@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/\+1-555-123-4567/)).toBeInTheDocument();
    });

    test('should handle long data values', () => {
      const mockAuth = {
        user: {
          name: 'Very Long Admin Name For Testing',
          email: 'very.long.email.address@subdomain.example.com',
          phone: '+1234567890123'
        }
      };
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Very Long Admin Name For Testing/)).toBeInTheDocument();
      expect(screen.getByText(/very.long.email.address@subdomain.example.com/)).toBeInTheDocument();
      expect(screen.getByText(/\+1234567890123/)).toBeInTheDocument();
    });

    test('should display different admin users when auth changes', () => {
      const mockAuth1 = {
        user: { name: 'Admin One', email: 'admin1@test.com', phone: '1111111111' }
      };
      useAuth.mockReturnValue([mockAuth1]);
      
      const { rerender } = render(<AdminDashboard />);
      expect(screen.getByText(/Admin One/)).toBeInTheDocument();
      
      const mockAuth2 = {
        user: { name: 'Admin Two', email: 'admin2@test.com', phone: '2222222222' }
      };
      useAuth.mockReturnValue([mockAuth2]);
      
      rerender(<AdminDashboard />);
      expect(screen.getByText(/Admin Two/)).toBeInTheDocument();
      expect(screen.queryByText(/Admin One/)).not.toBeInTheDocument();
    });

    test('should handle user object with extra properties that are not displayed', () => {
      const mockAuth = {
        user: {
          name: 'Admin',
          email: 'admin@test.com',
          phone: '123',
          role: 1,
          address: '123 Main St',
          age: 30
        }
      };
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      // Should display only name, email, phone
      expect(screen.getByText(/Admin/)).toBeInTheDocument();
      expect(screen.getByText(/admin@test.com/)).toBeInTheDocument();
      expect(screen.getByText(/123/)).toBeInTheDocument();
      // Should not display extra properties
      expect(screen.queryByText(/Main St/)).not.toBeInTheDocument();
    });
  });

  // ================== STATE-BASED TESTING ==================
  // Testing component behavior based on auth state
  
  describe('State-Based Tests - Auth State Management', () => {
    
    test('should call useAuth hook on component mount', () => {
      useAuth.mockReturnValue([{ user: { name: 'Test', email: 'test@test.com', phone: '123' } }]);
      
      render(<AdminDashboard />);
      
      expect(useAuth).toHaveBeenCalled();
    });

    test('should call useAuth hook exactly once during initial render', () => {
      useAuth.mockReturnValue([{ user: { name: 'Test', email: 'test@test.com', phone: '123' } }]);
      
      render(<AdminDashboard />);
      
      expect(useAuth).toHaveBeenCalledTimes(1);
    });

    test('should destructure only the first element from useAuth return value', () => {
      const setAuth = jest.fn();
      const mockAuthReturn = [
        { user: { name: 'Test', email: 'test@test.com', phone: '123' } },
        setAuth
      ];
      useAuth.mockReturnValue(mockAuthReturn);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Test/)).toBeInTheDocument();
      // Component should not use setAuth
      expect(setAuth).not.toHaveBeenCalled();
    });

    test('should re-render correctly when auth state changes', () => {
      const mockAuth1 = { user: { name: 'User One', email: 'user1@test.com', phone: '111' } };
      useAuth.mockReturnValue([mockAuth1]);
      
      const { rerender } = render(<AdminDashboard />);
      expect(screen.getByText(/User One/)).toBeInTheDocument();
      
      const mockAuth2 = { user: { name: 'User Two', email: 'user2@test.com', phone: '222' } };
      useAuth.mockReturnValue([mockAuth2]);
      
      rerender(<AdminDashboard />);
      expect(screen.getByText(/User Two/)).toBeInTheDocument();
      expect(screen.queryByText(/User One/)).not.toBeInTheDocument();
    });

    test('should handle transition from undefined to defined auth state', () => {
      useAuth.mockReturnValue([{}]);
      
      const { rerender } = render(<AdminDashboard />);
      
      const mockAuth = { user: { name: 'New Admin', email: 'new@test.com', phone: '999' } };
      useAuth.mockReturnValue([mockAuth]);
      
      rerender(<AdminDashboard />);
      expect(screen.getByText(/New Admin/)).toBeInTheDocument();
    });

    test('should handle transition from defined to undefined auth state', () => {
      const mockAuth = { user: { name: 'Admin', email: 'admin@test.com', phone: '123' } };
      useAuth.mockReturnValue([mockAuth]);
      
      const { rerender } = render(<AdminDashboard />);
      expect(screen.getByText(/Admin/)).toBeInTheDocument();
      
      useAuth.mockReturnValue([{}]);
      rerender(<AdminDashboard />);
      
      expect(screen.getByText(/Admin Name :/)).toBeInTheDocument();
      expect(screen.queryByText(/Admin(?! Name| Email| Contact)/)).not.toBeInTheDocument();
    });

    test('should maintain component structure regardless of auth state', () => {
      useAuth.mockReturnValue([{}]);
      
      const { container, rerender } = render(<AdminDashboard />);
      
      expect(container.querySelector('.container-fluid')).toBeInTheDocument();
      expect(container.querySelector('.row')).toBeInTheDocument();
      
      const mockAuth = { user: { name: 'Admin', email: 'admin@test.com', phone: '123' } };
      useAuth.mockReturnValue([mockAuth]);
      
      rerender(<AdminDashboard />);
      
      // Structure should remain the same
      expect(container.querySelector('.container-fluid')).toBeInTheDocument();
      expect(container.querySelector('.row')).toBeInTheDocument();
      expect(container.querySelector('.card')).toBeInTheDocument();
    });

    test('should update displayed user information when auth state updates', () => {
      const initialAuth = { user: { name: 'John', email: 'john@test.com', phone: '111' } };
      useAuth.mockReturnValue([initialAuth]);
      
      const { rerender } = render(<AdminDashboard />);
      
      expect(screen.getByText(/John/)).toBeInTheDocument();
      expect(screen.getByText(/john@test.com/)).toBeInTheDocument();
      expect(screen.getByText(/111/)).toBeInTheDocument();
      
      const updatedAuth = { user: { name: 'Jane', email: 'jane@test.com', phone: '222' } };
      useAuth.mockReturnValue([updatedAuth]);
      
      rerender(<AdminDashboard />);
      
      expect(screen.getByText(/Jane/)).toBeInTheDocument();
      expect(screen.getByText(/jane@test.com/)).toBeInTheDocument();
      expect(screen.getByText(/222/)).toBeInTheDocument();
      expect(screen.queryByText(/John/)).not.toBeInTheDocument();
    });

    test('should handle null to valid auth state transition', () => {
      useAuth.mockReturnValue([null]);
      
      const { rerender } = render(<AdminDashboard />);
      
      const mockAuth = { user: { name: 'Admin', email: 'admin@test.com', phone: '123' } };
      useAuth.mockReturnValue([mockAuth]);
      
      rerender(<AdminDashboard />);
      expect(screen.getByText(/Admin/)).toBeInTheDocument();
    });

    test('should not cause re-renders when auth object reference changes but values are same', () => {
      const userData = { name: 'Admin', email: 'admin@test.com', phone: '123' };
      useAuth.mockReturnValue([{ user: userData }]);
      
      const { rerender } = render(<AdminDashboard />);
      
      // Different object reference but same values
      useAuth.mockReturnValue([{ user: { ...userData } }]);
      
      rerender(<AdminDashboard />);
      
      // Should still display the same data
      expect(screen.getByText(/Admin/)).toBeInTheDocument();
      expect(screen.getByText(/admin@test.com/)).toBeInTheDocument();
    });
  });

  // ================== COMMUNICATION TESTING ==================
  // Testing integration with context and child components
  
  describe('Communication Tests - Component Integration', () => {
    
    test('should integrate correctly with Layout component', () => {
      useAuth.mockReturnValue([{ user: { name: 'Admin', email: 'admin@test.com', phone: '123' } }]);
      
      render(<AdminDashboard />);
      
      const layout = screen.getByTestId('layout');
      expect(layout).toBeInTheDocument();
      expect(layout.children.length).toBeGreaterThan(0);
    });

    test('should integrate correctly with AdminMenu component', () => {
      useAuth.mockReturnValue([{ user: { name: 'Admin', email: 'admin@test.com', phone: '123' } }]);
      
      render(<AdminDashboard />);
      
      const adminMenu = screen.getByTestId('admin-menu');
      expect(adminMenu).toBeInTheDocument();
    });

    test('should maintain proper component hierarchy: Layout > Container > Row > Columns', () => {
      useAuth.mockReturnValue([{ user: { name: 'Admin', email: 'admin@test.com', phone: '123' } }]);
      
      const { container } = render(<AdminDashboard />);
      
      const layout = screen.getByTestId('layout');
      const containerFluid = container.querySelector('.container-fluid');
      const row = container.querySelector('.row');
      
      expect(layout).toContainElement(containerFluid);
      expect(containerFluid).toContainElement(row);
    });

    test('should correctly receive and display auth data from useAuth hook', () => {
      const mockAuthData = {
        user: {
          name: 'Super Admin',
          email: 'super@admin.com',
          phone: '5555555555'
        },
        token: 'some-token'
      };
      useAuth.mockReturnValue([mockAuthData]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Super Admin/)).toBeInTheDocument();
      expect(screen.getByText(/super@admin.com/)).toBeInTheDocument();
      expect(screen.getByText(/5555555555/)).toBeInTheDocument();
    });

    test('should handle useAuth hook returning array with single element', () => {
      useAuth.mockReturnValue([{ user: { name: 'Admin', email: 'admin@test.com', phone: '123' } }]);
      
      const { container } = render(<AdminDashboard />);
      
      expect(container).toBeInTheDocument();
      expect(screen.getByText(/Admin/)).toBeInTheDocument();
    });

    test('should not call any auth state setter functions', () => {
      const setAuth = jest.fn();
      useAuth.mockReturnValue([
        { user: { name: 'Admin', email: 'admin@test.com', phone: '123' } },
        setAuth
      ]);
      
      render(<AdminDashboard />);
      
      expect(setAuth).not.toHaveBeenCalled();
    });

    test('should not modify auth context data when rendering', () => {
      const mockAuth = {
        user: {
          name: 'Admin',
          email: 'admin@test.com',
          phone: '123'
        }
      };
      const originalAuth = JSON.parse(JSON.stringify(mockAuth));
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      expect(mockAuth).toEqual(originalAuth);
    });

    test('should pass all children correctly to Layout component', () => {
      useAuth.mockReturnValue([{ user: { name: 'Admin', email: 'admin@test.com', phone: '123' } }]);
      
      render(<AdminDashboard />);
      
      const layout = screen.getByTestId('layout');
      const adminMenu = screen.getByTestId('admin-menu');
      const nameHeading = screen.getByText(/Admin Name/);
      
      expect(layout).toContainElement(adminMenu);
      expect(layout).toContainElement(nameHeading);
    });

    test('should render AdminMenu and admin info as separate sections', () => {
      useAuth.mockReturnValue([{ user: { name: 'Admin', email: 'admin@test.com', phone: '123' } }]);
      
      const { container } = render(<AdminDashboard />);
      
      const leftColumn = container.querySelector('.col-md-3');
      const rightColumn = container.querySelector('.col-md-9');
      
      expect(leftColumn).toContainElement(screen.getByTestId('admin-menu'));
      expect(rightColumn).not.toContainElement(screen.getByTestId('admin-menu'));
    });

    test('should handle useAuth returning different data structures gracefully', () => {
      // Test with extra properties in auth
      const mockAuth = {
        user: { name: 'Admin', email: 'admin@test.com', phone: '123' },
        token: 'abc123',
        isAuthenticated: true,
        expiresAt: Date.now()
      };
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Admin/)).toBeInTheDocument();
    });

    test('should use optional chaining to safely access nested user properties', () => {
      // This tests the component's resilience with missing nested data
      useAuth.mockReturnValue([{ user: undefined }]);
      
      const { container } = render(<AdminDashboard />);
      
      // Should not crash and should render structure
      expect(container).toBeInTheDocument();
      expect(screen.getByText(/Admin Name :/)).toBeInTheDocument();
    });

    test('should correctly display data when auth state contains only user object', () => {
      // Minimal valid auth state
      const mockAuth = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890'
        }
      };
      useAuth.mockReturnValue([mockAuth]);
      
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    });
  });
});