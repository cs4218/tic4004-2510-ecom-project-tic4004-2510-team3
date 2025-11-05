import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";

// Mock localStorage
Storage.prototype.getItem = jest.fn();
Storage.prototype.setItem = jest.fn();
Storage.prototype.removeItem = jest.fn();

describe("Cart State & Managament Testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 4. Test on empty cart state. 
  it("should initialize with empty cart if localStorage is empty", () => {
    Storage.prototype.getItem.mockReturnValueOnce(null);

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    const [cart] = result.current;

    expect(cart).toEqual([]);
  });

  //5. Test on load the cart correctly into state when localstroga had save cart
  it("should load existing cart from localStorage, if localStorage has saved cart", () => {
    const mockCart = [{ id: 1, name: "Laptop", price: 2200, qty: 1 }];
    Storage.prototype.getItem.mockReturnValueOnce(JSON.stringify(mockCart));

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    const [cart] = result.current;

    expect(cart).toEqual(mockCart);
  });

 
  // 6. Test on add 1 item to the cart 
  it("should add a single item to the cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      const [, setCart] = result.current;
      setCart([{ id: 2, name: "Keyboard", price: 400, qty: 1 }]);
    });

    const [cart] = result.current;
    expect(cart).toEqual([{ id: 2, name: "Keyboard", price: 400, qty: 1 }]);
  });

  //7. Test on several item adding at once (Domain testing)
  it("should allow adding multiple items without limit (domain test)", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      const [, setCart] = result.current;
      setCart([]);
    });

    act(() => {
      const [, setCart] = result.current;
      setCart((prev) => [
        ...prev,
        { id: 1, name: "Laptop", price: 2200, qty: 1 },
        { id: 2, name: "Keyboard", price: 400, qty: 1 },
        { id: 3, name: "Mouse", price: 100, qty: 2 },
      ]);
    });

    const [cart] = result.current;
    expect(cart.length).toBe(3);
  });
});
