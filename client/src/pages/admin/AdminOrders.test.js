import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminOrders from "./AdminOrders";
import { useAuth } from "../../context/auth";
import axios from "axios";
import moment from "moment";

// Mock dependencies
jest.mock("../../context/auth");
jest.mock("axios");
jest.mock("moment");
jest.mock("../../components/AdminMenu", () => {
  return function AdminMenu() {
    return <div data-testid="admin-menu">Admin Menu</div>;
  };
});
jest.mock("../../components/Layout", () => {
  return function Layout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

// Mock antd Select and Option components
jest.mock("antd", () => {
  const MockOption = ({ children, value }) => (
    <option value={value}>{children}</option>
  );

  const MockSelect = ({ children, onChange, defaultValue, bordered }) => (
    <select
      data-testid="status-select"
      onChange={(e) => onChange(e.target.value)}
      defaultValue={defaultValue}
      data-bordered={bordered}
    >
      {children}
    </select>
  );

  MockSelect.Option = MockOption;

  return {
    Select: MockSelect,
  };
});

describe("AdminOrders Component", () => {
  const mockSetAuth = jest.fn();
  const mockOrders = [
    {
      _id: "order1",
      status: "Processing",
      buyer: {
        name: "John Doe",
      },
      createAt: "2024-01-15T10:00:00Z",
      payment: {
        success: true,
      },
      products: [
        {
          _id: "prod1",
          name: "Product 1",
          description: "This is a great product with many features",
          price: 99.99,
        },
        {
          _id: "prod2",
          name: "Product 2",
          description: "Another amazing product",
          price: 149.99,
        },
      ],
    },
    {
      _id: "order2",
      status: "Shipped",
      buyer: {
        name: "Jane Smith",
      },
      createAt: "2024-01-14T15:30:00Z",
      payment: {
        success: false,
      },
      products: [
        {
          _id: "prod3",
          name: "Product 3",
          description: "Short desc",
          price: 49.99,
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock moment
    moment.mockImplementation((date) => ({
      fromNow: () => "2 days ago",
    }));

    // Mock useAuth with token
    useAuth.mockReturnValue([
      { user: { name: "Admin" }, token: "fake-token" },
      mockSetAuth,
    ]);

    // Mock axios get
    axios.get.mockResolvedValue({ data: mockOrders });
    axios.put.mockResolvedValue({ data: { success: true } });
  });

  const renderAdminOrders = () => {
    return render(
      <BrowserRouter>
        <AdminOrders />
      </BrowserRouter>
    );
  };

  test("renders AdminOrders component with all elements", async () => {
    renderAdminOrders();

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
    expect(screen.getByText("All Orders")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
    });
  });

  test("fetches and displays orders on mount when token exists", async () => {
    renderAdminOrders();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
    });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  test("does not fetch orders when token is missing", () => {
    useAuth.mockReturnValue([{}, mockSetAuth]);

    renderAdminOrders();

    expect(axios.get).not.toHaveBeenCalled();
  });

  test("displays order details correctly", async () => {
    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
  });

  test("displays products for each order", async () => {
    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText("Product 3")).toBeInTheDocument();
    expect(screen.getByText("Price : 99.99")).toBeInTheDocument();
    expect(screen.getByText("Price : 149.99")).toBeInTheDocument();
    expect(screen.getByText("Price : 49.99")).toBeInTheDocument();
  });

  test("truncates product description to 30 characters", async () => {
    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("This is a great product with m")).toBeInTheDocument();
    });
  });

  test("displays correct product quantity", async () => {
    renderAdminOrders();

    await waitFor(() => {
      const tables = screen.getAllByRole("table");
      expect(tables[0]).toHaveTextContent("2"); // First order has 2 products
      expect(tables[1]).toHaveTextContent("1"); // Second order has 1 product
    });
  });

  test("renders status dropdown with all status options", async () => {
    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Not Process")).toBeInTheDocument();
    });

    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("Shipped")).toBeInTheDocument();
    expect(screen.getByText("deliverd")).toBeInTheDocument();
    expect(screen.getByText("cancel")).toBeInTheDocument();
  });

  test("handles status change successfully", async () => {
    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const selects = screen.getAllByTestId("status-select");
    fireEvent.change(selects[0], { target: { value: "Shipped" } });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/order1", {
        status: "Shipped",
      });
    });

    // Verify getOrders is called again after status update
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  test("handles multiple status changes", async () => {
    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const selects = screen.getAllByTestId("status-select");
    
    fireEvent.change(selects[0], { target: { value: "Shipped" } });
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/order1", {
        status: "Shipped",
      });
    });

    fireEvent.change(selects[1], { target: { value: "deliverd" } });
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/order2", {
        status: "deliverd",
      });
    });
  });

  test("handles API error when fetching orders", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    axios.get.mockRejectedValue(new Error("Network error"));

    renderAdminOrders();

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleLogSpy.mockRestore();
  });

  test("handles API error when updating order status", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    axios.put.mockRejectedValue(new Error("Update failed"));

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const selects = screen.getAllByTestId("status-select");
    fireEvent.change(selects[0], { target: { value: "cancel" } });

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleLogSpy.mockRestore();
  });

  test("displays order index correctly", async () => {
    renderAdminOrders();

    await waitFor(() => {
      const tables = screen.getAllByRole("table");
      expect(tables[0]).toHaveTextContent("1");
      expect(tables[1]).toHaveTextContent("2");
    });
  });

  test("renders product images with correct src", async () => {
    renderAdminOrders();

    await waitFor(() => {
      const images = screen.getAllByRole("img");
      expect(images[0]).toHaveAttribute("src", "/api/v1/product/product-photo/prod1");
      expect(images[1]).toHaveAttribute("src", "/api/v1/product/product-photo/prod2");
      expect(images[2]).toHaveAttribute("src", "/api/v1/product/product-photo/prod3");
    });
  });

  test("renders with correct layout title", () => {
    renderAdminOrders();

    const layout = screen.getByTestId("layout");
    expect(layout).toHaveAttribute("data-title", "All Orders Data");
  });

  test("renders empty orders list when no orders exist", async () => {
    axios.get.mockResolvedValue({ data: [] });

    renderAdminOrders();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    expect(screen.getByText("All Orders")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  test("handles orders with missing optional fields", async () => {
    const incompleteOrders = [
      {
        _id: "order3",
        status: "Processing",
        buyer: {
          name: "Test User",
        },
        createAt: "2024-01-15T10:00:00Z",
        payment: {
          success: true,
        },
        products: [],
      },
    ];

    axios.get.mockResolvedValue({ data: incompleteOrders });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    const tables = screen.getAllByRole("table");
    expect(tables[0]).toHaveTextContent("0"); // No products
  });

  test("re-fetches orders when auth token changes", async () => {
    const { rerender } = renderAdminOrders();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    // Update auth with new token
    useAuth.mockReturnValue([
      { user: { name: "Admin" }, token: "new-token" },
      mockSetAuth,
    ]);

    rerender(
      <BrowserRouter>
        <AdminOrders />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  test("handles orders with null buyer data", async () => {
    const ordersWithNullBuyer = [
      {
        _id: "order4",
        status: "Processing",
        buyer: null,
        createAt: "2024-01-15T10:00:00Z",
        payment: { success: true },
        products: [{ _id: "prod4", name: "Product 4", description: "Test", price: 50 }],
      },
    ];

    axios.get.mockResolvedValue({ data: ordersWithNullBuyer });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Product 4")).toBeInTheDocument();
    });

    // Should not crash when buyer is null
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("handles orders with undefined buyer data", async () => {
    const ordersWithUndefinedBuyer = [
      {
        _id: "order5",
        status: "Processing",
        buyer: undefined,
        createAt: "2024-01-15T10:00:00Z",
        payment: { success: true },
        products: [{ _id: "prod5", name: "Product 5", description: "Test", price: 50 }],
      },
    ];

    axios.get.mockResolvedValue({ data: ordersWithUndefinedBuyer });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Product 5")).toBeInTheDocument();
    });

    // Should not crash when buyer is undefined
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("handles orders with null products array", async () => {
    const ordersWithNullProducts = [
      {
        _id: "order6",
        status: "Processing",
        buyer: { name: "Test User" },
        createAt: "2024-01-15T10:00:00Z",
        payment: { success: true },
        products: null,
      },
    ];

    axios.get.mockResolvedValue({ data: ordersWithNullProducts });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Should not crash when products is null
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("handles orders with undefined products array", async () => {
    const ordersWithUndefinedProducts = [
      {
        _id: "order7",
        status: "Processing",
        buyer: { name: "Test User" },
        createAt: "2024-01-15T10:00:00Z",
        payment: { success: true },
        products: undefined,
      },
    ];

    axios.get.mockResolvedValue({ data: ordersWithUndefinedProducts });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Should not crash when products is undefined
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("handles products with missing description", async () => {
    const ordersWithMissingDescription = [
      {
        _id: "order8",
        status: "Processing",
        buyer: { name: "Test User" },
        createAt: "2024-01-15T10:00:00Z",
        payment: { success: true },
        products: [
          {
            _id: "prod6",
            name: "Product 6",
            description: null,
            price: 50,
          },
        ],
      },
    ];

    axios.get.mockResolvedValue({ data: ordersWithMissingDescription });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Product 6")).toBeInTheDocument();
    });

    // Should not crash when description is null
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("handles products with undefined description", async () => {
    const ordersWithUndefinedDescription = [
      {
        _id: "order9",
        status: "Processing",
        buyer: { name: "Test User" },
        createAt: "2024-01-15T10:00:00Z",
        payment: { success: true },
        products: [
          {
            _id: "prod7",
            name: "Product 7",
            description: undefined,
            price: 50,
          },
        ],
      },
    ];

    axios.get.mockResolvedValue({ data: ordersWithUndefinedDescription });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Product 7")).toBeInTheDocument();
    });

    // Should not crash when description is undefined
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("handles orders with null payment data", async () => {
    const ordersWithNullPayment = [
      {
        _id: "order10",
        status: "Processing",
        buyer: { name: "Test User" },
        createAt: "2024-01-15T10:00:00Z",
        payment: null,
        products: [{ _id: "prod8", name: "Product 8", description: "Test", price: 50 }],
      },
    ];

    axios.get.mockResolvedValue({ data: ordersWithNullPayment });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Product 8")).toBeInTheDocument();
    });

    // Should not crash when payment is null
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("handles orders with undefined payment data", async () => {
    const ordersWithUndefinedPayment = [
      {
        _id: "order11",
        status: "Processing",
        buyer: { name: "Test User" },
        createAt: "2024-01-15T10:00:00Z",
        payment: undefined,
        products: [{ _id: "prod9", name: "Product 9", description: "Test", price: 50 }],
      },
    ];

    axios.get.mockResolvedValue({ data: ordersWithUndefinedPayment });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Product 9")).toBeInTheDocument();
    });

    // Should not crash when payment is undefined
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("handles orders with null createAt date", async () => {
    const ordersWithNullDate = [
      {
        _id: "order12",
        status: "Processing",
        buyer: { name: "Test User" },
        createAt: null,
        payment: { success: true },
        products: [{ _id: "prod10", name: "Product 10", description: "Test", price: 50 }],
      },
    ];

    axios.get.mockResolvedValue({ data: ordersWithNullDate });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Product 10")).toBeInTheDocument();
    });

    // Should not crash when createAt is null
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("handles orders with undefined createAt date", async () => {
    const ordersWithUndefinedDate = [
      {
        _id: "order13",
        status: "Processing",
        buyer: { name: "Test User" },
        createAt: undefined,
        payment: { success: true },
        products: [{ _id: "prod11", name: "Product 11", description: "Test", price: 50 }],
      },
    ];

    axios.get.mockResolvedValue({ data: ordersWithUndefinedDate });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Product 11")).toBeInTheDocument();
    });

    // Should not crash when createAt is undefined
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("handles status change with network error", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    axios.put.mockRejectedValue(new Error("Network error"));

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const selects = screen.getAllByTestId("status-select");
    fireEvent.change(selects[0], { target: { value: "Shipped" } });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/order1", {
        status: "Shipped",
      });
    });

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleLogSpy.mockRestore();
  });

  test("handles getOrders API failure with console error", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    axios.get.mockRejectedValue(new Error("API failure"));

    renderAdminOrders();

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleLogSpy.mockRestore();
  });

  test("handles status change API failure with console error", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    axios.put.mockRejectedValue(new Error("Status update failed"));

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const selects = screen.getAllByTestId("status-select");
    fireEvent.change(selects[0], { target: { value: "cancel" } });

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleLogSpy.mockRestore();
  });

  test("displays all status options in dropdown", async () => {
    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("Not Process")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("Shipped")).toBeInTheDocument();
      expect(screen.getByText("deliverd")).toBeInTheDocument();
      expect(screen.getByText("cancel")).toBeInTheDocument();
    });
  });

  test("handles moment.js date formatting", async () => {
    const mockMoment = jest.fn(() => ({
      fromNow: jest.fn(() => "3 hours ago"),
    }));
    moment.mockImplementation(mockMoment);

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(mockMoment).toHaveBeenCalledWith("2024-01-15T10:00:00Z");
  });

  test("handles multiple orders with different statuses", async () => {
    const multipleOrders = [
      {
        _id: "order14",
        status: "Not Process",
        buyer: { name: "User 1" },
        createAt: "2024-01-15T10:00:00Z",
        payment: { success: true },
        products: [{ _id: "prod12", name: "Product 12", description: "Test", price: 50 }],
      },
      {
        _id: "order15",
        status: "deliverd",
        buyer: { name: "User 2" },
        createAt: "2024-01-14T10:00:00Z",
        payment: { success: false },
        products: [{ _id: "prod13", name: "Product 13", description: "Test", price: 75 }],
      },
    ];

    axios.get.mockResolvedValue({ data: multipleOrders });

    renderAdminOrders();

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.getByText("User 2")).toBeInTheDocument();
    });

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});