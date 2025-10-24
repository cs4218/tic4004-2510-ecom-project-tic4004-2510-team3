import React from "react";
import { render, fireEvent } from "@testing-library/react";
import axios from "axios";
import { AuthProvider, useAuth } from "./auth";
import "@testing-library/jest-dom/extend-expect";

// Mocking axios.post
jest.mock("axios", () => ({
  defaults: { headers: { common: {} } },
}));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Dummy component to used for testing
const TestComponent = () => {
  const [auth, setAuth] = useAuth();

  return (
    <>
      <div data-testid="user">{auth?.user?.name || ""}</div>
      <div data-testid="token">{auth?.token || ""}</div>
      <button
        onClick={() => setAuth({ user: { name: "Testing" }, token: "abcd1234" })}
      >
        Update Auth
      </button>
    </>
  );
};

describe("Auth Context (UI-Style Test)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // Testing on default state
  it("provides default auth state", () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId("user").textContent).toBe("");
    expect(getByTestId("token").textContent).toBe("");
  });

  // Testing for temp account on local storage
  it("loads saved auth state from localStorage", () => {
    const mockData = { user: { name: "temp" }, token: "xyz123" };
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockData));

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId("user").textContent).toBe("temp");
    expect(getByTestId("token").textContent).toBe("xyz123");
  });

  // Testing to confirm that the axios header is able to update with the new token
  it("updates auth and axios Authorization header", () => {
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(getByText("Update Auth"));

    expect(getByTestId("user").textContent).toBe("Testing");
    expect(getByTestId("token").textContent).toBe("abcd1234");

    const axiosInstance = require("axios");
    expect(axiosInstance.defaults.headers.common["Authorization"]).toBe("abcd1234");
  });
});
