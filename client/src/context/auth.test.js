import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth";
import axios from "axios";

// Mock axios defaults
jest.mock("axios", () => ({
  defaults: { headers: { common: {} } },
  get: jest.fn(),
  post: jest.fn(),
}));

describe("Authentication State & User Login State Testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // 1. Test on if there is nothing saved in localStorage, the auth state should start off empty
  it("should initialize with null if localStorage is empty", () => {
    localStorage.getItem = jest.fn().mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    const [auth] = result.current;

    expect(auth).toEqual({ user: null, token: "" });
    expect(axios.defaults.headers.common["Authorization"]).toBe("");
  });

  //2. Test on whether it update the new auth info when setauth function is call
  it("should update auth state when setAuth is called", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      const [, setAuth] = result.current;
      setAuth({ user: { id: 3, name: "Charlic" }, token: "zxcasd789" });
    });

    const [auth] = result.current;
    expect(auth.user).toEqual({ id: 3, name: "Charlic" });
    expect(auth.token).toBe("zxcasd789");
    expect(axios.defaults.headers.common["Authorization"]).toBe("zxcasd789");
  });

  //3. Error & Exception Testing to handle invalid data in storage
  it("should handle invalid JSON in localStorage ", () => {
    localStorage.getItem = jest.fn().mockReturnValue("invalid JSON");

    jest.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    const [auth] = result.current;

    expect(auth).toEqual({ user: null, token: "" });
    expect(axios.defaults.headers.common["Authorization"]).toBe("");

    console.error.mockRestore();
  });

});
