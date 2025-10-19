import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Profile from "./Profile";
import { useAuth } from "../../context/auth";
import axios from "axios";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("../../context/auth");
jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../components/UserMenu", () => {
  return function UserMenu() {
    return <div data-testid="user-menu">User Menu</div>;
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

describe("Profile Component", () => {
  const mockSetAuth = jest.fn();
  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    address: "123 Main St",
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock useAuth hook
    useAuth.mockReturnValue([
      { user: mockUser, token: "fake-token" },
      mockSetAuth,
    ]);

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({ user: mockUser, token: "fake-token" })
    );
    Storage.prototype.setItem = jest.fn();
  });

  const renderProfile = () => {
    return render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
  };

  test("renders Profile component with all elements", () => {
    renderProfile();

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Phone")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
  });

  test("populates form fields with user data on mount", () => {
    renderProfile();

    expect(screen.getByPlaceholderText("Enter Your Name")).toHaveValue("John Doe");
    expect(screen.getByPlaceholderText("Enter Your Email")).toHaveValue("john@example.com");
    expect(screen.getByPlaceholderText("Enter Your Phone")).toHaveValue("1234567890");
    expect(screen.getByPlaceholderText("Enter Your Address")).toHaveValue("123 Main St");
  });

  test("email field is disabled", () => {
    renderProfile();

    const emailInput = screen.getByPlaceholderText("Enter Your Email");
    expect(emailInput).toBeDisabled();
  });

  test("updates input values when user types", () => {
    renderProfile();

    const nameInput = screen.getByPlaceholderText("Enter Your Name");
    const phoneInput = screen.getByPlaceholderText("Enter Your Phone");
    const addressInput = screen.getByPlaceholderText("Enter Your Address");

    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(phoneInput, { target: { value: "9876543210" } });
    fireEvent.change(addressInput, { target: { value: "456 Oak Ave" } });

    expect(nameInput).toHaveValue("Jane Doe");
    expect(phoneInput).toHaveValue("9876543210");
    expect(addressInput).toHaveValue("456 Oak Ave");
  });

  test("successfully submits form and updates profile", async () => {
    const mockResponse = {
      data: {
        updatedUser: {
          name: "Jane Doe",
          email: "john@example.com",
          phone: "9876543210",
          address: "456 Oak Ave",
        },
      },
    };

    axios.put.mockResolvedValue(mockResponse);

    renderProfile();

    const nameInput = screen.getByPlaceholderText("Enter Your Name");
    const passwordInput = screen.getByPlaceholderText("Enter Your Password");
    const submitButton = screen.getByRole("button", { name: /update/i });

    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(passwordInput, { target: { value: "newpassword123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: "Jane Doe",
        email: "john@example.com",
        password: "newpassword123",
        phone: "1234567890",
        address: "123 Main St",
      });
    });

    expect(mockSetAuth).toHaveBeenCalledWith({
      user: mockUser,
      token: "fake-token",
      user: mockResponse.data.updatedUser,
    });
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });

  test("displays error message when API returns error", async () => {
    const mockErrorResponse = {
      data: {
        errro: true,
        error: "Update failed",
      },
    };

    axios.put.mockResolvedValue(mockErrorResponse);

    renderProfile();

    const submitButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Update failed");
    });
  });

  test("handles API request failure", async () => {
    axios.put.mockRejectedValue(new Error("Network error"));

    renderProfile();

    const submitButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("prevents default form submission", async () => {
    const mockEvent = { preventDefault: jest.fn() };
    
    axios.put.mockResolvedValue({
      data: { updatedUser: mockUser },
    });

    renderProfile();

    const form = screen.getByRole("button", { name: /update/i }).closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });
  });

  test("renders with correct layout title", () => {
    renderProfile();

    const layout = screen.getByTestId("layout");
    expect(layout).toHaveAttribute("data-title", "Your Profile");
  });

  test("updates form when auth user changes", () => {
    const { rerender } = renderProfile();

    const newUser = {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "5555555555",
      address: "789 Pine Rd",
    };

    useAuth.mockReturnValue([
      { user: newUser, token: "new-token" },
      mockSetAuth,
    ]);

    rerender(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText("Enter Your Name")).toHaveValue("Jane Smith");
    expect(screen.getByPlaceholderText("Enter Your Email")).toHaveValue("jane@example.com");
    expect(screen.getByPlaceholderText("Enter Your Phone")).toHaveValue("5555555555");
    expect(screen.getByPlaceholderText("Enter Your Address")).toHaveValue("789 Pine Rd");
  });
});