import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Pagenotfound from "./Pagenotfound";

// Mock components
jest.mock("../components/Layout", () => ({ children }) => (
  <div data-testid="mock-layout">{children}</div>
));

jest.mock("../components/Header", () => () => <div data-testid="mock-header">Header</div>);
jest.mock("../context/auth", () => ({
  useAuth: () => [{ user: null, token: "" }, jest.fn()],
}));



describe("Pagenotfound Component", () => {
  test("renders 404 page correctly", () => {

    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );

    const title = screen.getByText("404");
    const heading = screen.getByText("Oops ! Page Not Found");
    const link = screen.getByRole("link", { name: /Go Back/i });

    expect(title).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
