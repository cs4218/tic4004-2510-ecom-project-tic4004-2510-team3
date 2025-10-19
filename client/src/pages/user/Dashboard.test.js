import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";

// Mock the child components
jest.mock("../../components/Layout", () => ({ children }) => (
  <div data-testid="mock-layout">{children}</div>
));

jest.mock("../../components/UserMenu", () => () => (
  <div data-testid="mock-usermenu">UserMenu</div>
));

// Mock the useAuth hook
jest.mock("../../context/auth", () => ({
  useAuth: () => [
    {
      user: {
        name: "John Doe",
        email: "john@example.com",
        address: "123 Main St",
      },
    },
  ],
}));

describe("Dashboard Component", () => {
  it("renders user details from auth context", () => {
    render(<Dashboard />);

    // Check layout is rendered
    expect(screen.getByTestId("mock-layout")).toBeInTheDocument();

    // Check user details
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();

    // Check user menu
    expect(screen.getByTestId("mock-usermenu")).toBeInTheDocument();
  });
});
