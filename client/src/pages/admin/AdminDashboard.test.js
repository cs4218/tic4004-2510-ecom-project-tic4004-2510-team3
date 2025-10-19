import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../../context/auth";

// Mock dependencies
jest.mock("../../context/auth");
jest.mock("../../components/AdminMenu", () => {
  return function AdminMenu() {
    return <div data-testid="admin-menu">Admin Menu</div>;
  };
});
jest.mock("../../components/Layout", () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe("AdminDashboard Component", () => {
  const renderAdminDashboard = () => {
    return render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders AdminDashboard component with all elements", () => {
    const mockAuth = {
      user: {
        name: "Admin User",
        email: "admin@example.com",
        phone: "1234567890",
      },
      token: "fake-admin-token",
    };

    useAuth.mockReturnValue([mockAuth]);

    renderAdminDashboard();

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
    expect(screen.getByText(/Admin Name :/)).toBeInTheDocument();
    expect(screen.getByText(/Admin Email :/)).toBeInTheDocument();
    expect(screen.getByText(/Admin Contact :/)).toBeInTheDocument();
  });

  test("displays admin user information correctly", () => {
    const mockAuth = {
      user: {
        name: "John Admin",
        email: "john.admin@example.com",
        phone: "9876543210",
      },
      token: "fake-admin-token",
    };

    useAuth.mockReturnValue([mockAuth]);

    renderAdminDashboard();

    expect(screen.getByText("Admin Name : John Admin")).toBeInTheDocument();
    expect(screen.getByText("Admin Email : john.admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact : 9876543210")).toBeInTheDocument();
  });

  test("renders correctly when auth user data is missing", () => {
    useAuth.mockReturnValue([{}]);

    renderAdminDashboard();

    expect(screen.getByText(/Admin Name :/)).toBeInTheDocument();
    expect(screen.getByText(/Admin Email :/)).toBeInTheDocument();
    expect(screen.getByText(/Admin Contact :/)).toBeInTheDocument();
  });

  test("renders correctly when auth is null", () => {
    useAuth.mockReturnValue([null]);

    renderAdminDashboard();

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
  });

  test("renders correctly when user object is null", () => {
    const mockAuth = {
      user: null,
      token: "fake-admin-token",
    };

    useAuth.mockReturnValue([mockAuth]);

    renderAdminDashboard();

    expect(screen.getByText(/Admin Name :/)).toBeInTheDocument();
    expect(screen.getByText(/Admin Email :/)).toBeInTheDocument();
    expect(screen.getByText(/Admin Contact :/)).toBeInTheDocument();
  });

  test("renders card with correct styling classes", () => {
    const mockAuth = {
      user: {
        name: "Admin User",
        email: "admin@example.com",
        phone: "1234567890",
      },
    };

    useAuth.mockReturnValue([mockAuth]);

    renderAdminDashboard();

    const card = screen.getByText(/Admin Name :/).closest(".card");
    expect(card).toHaveClass("w-75", "p-3");
  });

  test("renders with correct container structure", () => {
    const mockAuth = {
      user: {
        name: "Admin User",
        email: "admin@example.com",
        phone: "1234567890",
      },
    };

    useAuth.mockReturnValue([mockAuth]);

    const { container } = renderAdminDashboard();

    expect(container.querySelector(".container-fluid")).toBeInTheDocument();
    expect(container.querySelector(".row")).toBeInTheDocument();
    expect(container.querySelector(".col-md-3")).toBeInTheDocument();
    expect(container.querySelector(".col-md-9")).toBeInTheDocument();
  });

  test("displays different admin users correctly", () => {
    const mockAuth1 = {
      user: {
        name: "Alice Admin",
        email: "alice@example.com",
        phone: "1111111111",
      },
    };

    useAuth.mockReturnValue([mockAuth1]);

    const { rerender } = renderAdminDashboard();

    expect(screen.getByText("Admin Name : Alice Admin")).toBeInTheDocument();

    // Update with different admin
    const mockAuth2 = {
      user: {
        name: "Bob Admin",
        email: "bob@example.com",
        phone: "2222222222",
      },
    };

    useAuth.mockReturnValue([mockAuth2]);

    rerender(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText("Admin Name : Bob Admin")).toBeInTheDocument();
    expect(screen.getByText("Admin Email : bob@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact : 2222222222")).toBeInTheDocument();
  });

  test("handles partial user data gracefully", () => {
    const mockAuth = {
      user: {
        name: "Partial Admin",
        // email and phone missing
      },
    };

    useAuth.mockReturnValue([mockAuth]);

    renderAdminDashboard();

    expect(screen.getByText("Admin Name : Partial Admin")).toBeInTheDocument();
    expect(screen.getByText(/Admin Email :/)).toBeInTheDocument();
    expect(screen.getByText(/Admin Contact :/)).toBeInTheDocument();
  });
});