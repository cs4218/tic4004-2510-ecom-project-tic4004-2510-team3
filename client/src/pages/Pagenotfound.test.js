import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Pagenotfound from "./Pagenotfound";

// Mock only the Header component and Auth context (Layout mock is unused)
jest.mock("../components/Header", () => () => (
  <div data-testid="mock-header">Header</div>
));

jest.mock("../context/auth", () => ({
  useAuth: () => [{ user: null, token: "" }, jest.fn()],
}));

describe("Pagenotfound Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the 404 title", () => {
    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders the main heading correctly", () => {
    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );

    expect(screen.getByText("Oops ! Page Not Found")).toBeInTheDocument();
  });

  it("renders the mocked Header component", () => {
    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
  });
});
