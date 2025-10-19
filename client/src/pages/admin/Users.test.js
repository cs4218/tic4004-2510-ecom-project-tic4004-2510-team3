import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Users from './Users';

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

describe('Users Component', () => {
  const renderUsers = () => {
    return render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );
  };

  describe('Component Rendering', () => {
    test('renders Users component with correct title', () => {
      renderUsers();

      expect(screen.getByText('Dashboard - All Users')).toBeInTheDocument();
      expect(screen.getByText('All Users')).toBeInTheDocument();
      expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    test('renders correct container structure', () => {
      renderUsers();

      const container = screen.getByTestId('layout').querySelector('.container-fluid');
      expect(container).toHaveClass('m-3', 'p-3');
      
      const row = container.querySelector('.row');
      expect(row).toBeInTheDocument();
    });

    test('renders admin menu in correct column', () => {
      renderUsers();

      const adminMenuCol = screen.getByTestId('admin-menu').closest('.col-md-3');
      expect(adminMenuCol).toBeInTheDocument();
    });

    test('renders users content in correct column', () => {
      renderUsers();

      const usersCol = screen.getByText('All Users').closest('.col-md-9');
      expect(usersCol).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    test('has correct Bootstrap grid structure', () => {
      renderUsers();

      const row = screen.getByTestId('layout').querySelector('.row');
      expect(row).toBeInTheDocument();

      const colMd3 = row.querySelector('.col-md-3');
      const colMd9 = row.querySelector('.col-md-9');
      
      expect(colMd3).toBeInTheDocument();
      expect(colMd9).toBeInTheDocument();
    });

    test('admin menu is in left column', () => {
      renderUsers();

      const adminMenu = screen.getByTestId('admin-menu');
      const leftColumn = adminMenu.closest('.col-md-3');
      
      expect(leftColumn).toBeInTheDocument();
      expect(leftColumn).toContainElement(adminMenu);
    });

    test('users content is in right column', () => {
      renderUsers();

      const usersHeading = screen.getByText('All Users');
      const rightColumn = usersHeading.closest('.col-md-9');
      
      expect(rightColumn).toBeInTheDocument();
      expect(rightColumn).toContainElement(usersHeading);
    });
  });

  describe('Component Content', () => {
    test('displays correct heading text', () => {
      renderUsers();

      const heading = screen.getByText('All Users');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    test('has correct page title in Layout', () => {
      renderUsers();

      const pageTitle = screen.getByText('Dashboard - All Users');
      expect(pageTitle).toBeInTheDocument();
    });

    test('renders admin menu component', () => {
      renderUsers();

      const adminMenu = screen.getByTestId('admin-menu');
      expect(adminMenu).toBeInTheDocument();
      expect(adminMenu).toHaveTextContent('Admin Menu');
    });
  });

  describe('Styling and Classes', () => {
    test('container has correct Bootstrap classes', () => {
      renderUsers();

      const container = screen.getByTestId('layout').querySelector('.container-fluid');
      expect(container).toHaveClass('container-fluid', 'm-3', 'p-3');
    });

    test('row has correct Bootstrap class', () => {
      renderUsers();

      const row = screen.getByTestId('layout').querySelector('.row');
      expect(row).toHaveClass('row');
    });

    test('columns have correct Bootstrap classes', () => {
      renderUsers();

      const colMd3 = screen.getByTestId('layout').querySelector('.col-md-3');
      const colMd9 = screen.getByTestId('layout').querySelector('.col-md-9');
      
      expect(colMd3).toHaveClass('col-md-3');
      expect(colMd9).toHaveClass('col-md-9');
    });
  });

  describe('Component Structure', () => {
    test('has proper nesting structure', () => {
      renderUsers();

      const layout = screen.getByTestId('layout');
      const container = layout.querySelector('.container-fluid');
      const row = container.querySelector('.row');
      const colMd3 = row.querySelector('.col-md-3');
      const colMd9 = row.querySelector('.col-md-9');
      
      expect(layout).toContainElement(container);
      expect(container).toContainElement(row);
      expect(row).toContainElement(colMd3);
      expect(row).toContainElement(colMd9);
    });

    test('admin menu is properly nested', () => {
      renderUsers();

      const adminMenu = screen.getByTestId('admin-menu');
      const colMd3 = adminMenu.closest('.col-md-3');
      const row = colMd3.closest('.row');
      const container = row.closest('.container-fluid');
      const layout = container.closest('[data-testid="layout"]');
      
      expect(layout).toBeInTheDocument();
      expect(container).toBeInTheDocument();
      expect(row).toBeInTheDocument();
      expect(colMd3).toBeInTheDocument();
      expect(adminMenu).toBeInTheDocument();
    });

    test('users heading is properly nested', () => {
      renderUsers();

      const usersHeading = screen.getByText('All Users');
      const colMd9 = usersHeading.closest('.col-md-9');
      const row = colMd9.closest('.row');
      const container = row.closest('.container-fluid');
      const layout = container.closest('[data-testid="layout"]');
      
      expect(layout).toBeInTheDocument();
      expect(container).toBeInTheDocument();
      expect(row).toBeInTheDocument();
      expect(colMd9).toBeInTheDocument();
      expect(usersHeading).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      renderUsers();

      const pageTitle = screen.getByText('Dashboard - All Users');
      const sectionHeading = screen.getByText('All Users');
      
      expect(pageTitle.tagName).toBe('H1');
      expect(sectionHeading.tagName).toBe('H1');
    });

    test('admin menu is accessible', () => {
      renderUsers();

      const adminMenu = screen.getByTestId('admin-menu');
      expect(adminMenu).toBeInTheDocument();
      expect(adminMenu).toHaveTextContent('Admin Menu');
    });
  });

  describe('Component Props', () => {
    test('Layout receives correct title prop', () => {
      renderUsers();

      // The Layout component should receive the title prop
      // We can verify this by checking if the title is rendered
      expect(screen.getByText('Dashboard - All Users')).toBeInTheDocument();
    });

    test('Layout renders children correctly', () => {
      renderUsers();

      // Verify that the Layout component renders its children
      expect(screen.getByText('All Users')).toBeInTheDocument();
      expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
    });
  });

  describe('Future Extensibility', () => {
    test('component structure supports adding user list', () => {
      renderUsers();

      // The current structure should support adding a user list
      // in the col-md-9 div without breaking the layout
      const usersColumn = screen.getByText('All Users').closest('.col-md-9');
      expect(usersColumn).toBeInTheDocument();
      
      // This column can be extended to include user list components
      expect(usersColumn).toHaveClass('col-md-9');
    });

    test('component is ready for user data integration', () => {
      renderUsers();

      // The component structure is simple and can easily be extended
      // to include user data fetching and display
      const usersHeading = screen.getByText('All Users');
      expect(usersHeading).toBeInTheDocument();
      
      // This heading can be used as a reference point for adding user list
      expect(usersHeading.closest('.col-md-9')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('component renders without crashing', () => {
      expect(() => {
        renderUsers();
      }).not.toThrow();
    });

    test('component handles missing props gracefully', () => {
      // The component doesn't take any props, so this test ensures
      // it works with default behavior
      expect(() => {
        renderUsers();
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('component renders efficiently', () => {
      const startTime = performance.now();
      renderUsers();
      const endTime = performance.now();
      
      // Component should render quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('component has minimal DOM nodes', () => {
      const { container } = renderUsers();
      const domNodes = container.querySelectorAll('*');
      
      // Should have a reasonable number of DOM nodes
      expect(domNodes.length).toBeLessThan(20);
    });
  });
});

