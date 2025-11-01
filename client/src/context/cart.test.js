import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";
import "@testing-library/jest-dom/extend-expect";

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Test component to interact with cart for single-item adding
const TestComponent = () => {
  const [cart, setCart] = useCart();

  return (
    <>
      <div data-testid="cart-json">{JSON.stringify(cart)}</div>
      <button
        onClick={() =>
          setCart([{ id: 3, name: "Keyboard", price: 400, qty: 1 }])
        }
      >
        Add Keyboard
      </button>
    </>
  );
};

// Test component for multiple-item adding
const TestMultipleItems = () => {
  const [cart, setCart] = useCart();

  return (
    <>
      <div data-testid="cart-json">{JSON.stringify(cart)}</div>
      <button
        onClick={() =>
          setCart((prev) => [...prev, { id: 3, name: "Keyboard", price: 400, qty: 1 }])
        }
      >
        Add Keyboard
      </button>
      <button
        onClick={() =>
          setCart((prev) => [...prev, { id: 4, name: "Mouse", price: 100, qty: 2 }])
        }
      >
        Add Mouse
      </button>
    </>
  );
};

describe("Cart Context (UI-Style Test)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // 1.Testing for default cart state. It should be empty
  it("shows empty cart by default", () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(getByTestId("cart-json").textContent).toBe("[]");
  });

  // 2. Loads existing cart items from localStorage everythime when app re-open and the cart item sld be remain if we never remove
  it("loads cart data from localStorage", () => {
    const mockCart = [
      { id: 1, name: "Laptop", price: 2200, qty: 1 },
      { id: 2, name: "Mouse", price: 100, qty: 2 },
    ];
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCart));

    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(getByTestId("cart-json").textContent).toBe(JSON.stringify(mockCart));
  });

  // 3. Update cart with a single item adding
  it("updates cart when setCart is called", () => {
    const { getByText, getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    fireEvent.click(getByText("Add Keyboard"));
    expect(getByTestId("cart-json").textContent).toBe(
      JSON.stringify([{ id: 3, name: "Keyboard", price: 400, qty: 1 }])
    );
  });

  // 4. Add multiple items sequentially
  it("adds multiple items to the cart correctly", () => {
    const { getByText, getByTestId } = render(
      <CartProvider>
        <TestMultipleItems />
      </CartProvider>
    );

    fireEvent.click(getByText("Add Keyboard"));
    fireEvent.click(getByText("Add Mouse"));

    expect(getByTestId("cart-json").textContent).toBe(
      JSON.stringify([
        { id: 3, name: "Keyboard", price: 400, qty: 1 },
        { id: 4, name: "Mouse", price: 100, qty: 2 },
      ])
    );
  });
});
