import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Orders from "./Orders";
import axios from "axios";

// Mock child components
jest.mock("../../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

jest.mock("../../components/UserMenu", () => () => (
  <div data-testid="usermenu">UserMenu</div>
));

// Default mock for useAuth
const mockUseAuth = jest.fn();
jest.mock("../../context/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock axios
jest.mock("axios");

describe("Orders Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders orders after successful API call with payment success", async () => {
    mockUseAuth.mockReturnValue([{ token: "fake-token" }, jest.fn()]);

    axios.get.mockResolvedValueOnce({
      data: [
        {
          status: "Delivered",
          buyer: { name: "Alice" },
          createAt: new Date().toISOString(),
          payment: { success: true },
          products: [
            {
              _id: "p1",
              name: "Test Product",
              description: "This is a test product description",
              price: 100,
            },
          ],
        },
      ],
    });

    render(<Orders />);

    expect(screen.getByText("All Orders")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Delivered")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText(/Price : 100/)).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
  });

  it("renders Failed payment status when payment is not successful", async () => {
    mockUseAuth.mockReturnValue([{ token: "fake-token" }, jest.fn()]);

    axios.get.mockResolvedValueOnce({
      data: [
        {
          status: "Pending",
          buyer: { name: "Bob" },
          createAt: new Date().toISOString(),
          payment: { success: false },
          products: [],
        },
      ],
    });

    render(<Orders />);

    await waitFor(() => {
      expect(screen.getByText("Failed")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  it("handles API failure gracefully", async () => {
    mockUseAuth.mockReturnValue([{ token: "fake-token" }, jest.fn()]);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    render(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("does not call API when no auth token", () => {
    mockUseAuth.mockReturnValue([{}, jest.fn()]);

    render(<Orders />);

    expect(axios.get).not.toHaveBeenCalled();
  });

  it("renders Layout and UserMenu", () => {
    mockUseAuth.mockReturnValue([{ token: "fake-token" }, jest.fn()]);

    render(<Orders />);

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("usermenu")).toBeInTheDocument();
  });
});
