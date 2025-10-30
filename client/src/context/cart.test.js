import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";
import "@testing-library/jest-dom/extend-expect";

//Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

//Dummy component to interact with cart for testing
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

describe("Cart Context (UI-Style Test)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // Testing for default cart status
  it("shows empty cart by default", () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(getByTestId("cart-json").textContent).toBe("[]");
  });

  //Testing for adding item to the cart
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

  // Testing for update item to the cart
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
});