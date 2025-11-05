import { renderHook, act } from "@testing-library/react";
import { useSearch, SearchProvider } from "./search";

describe("Search Functionality & Product Search State Testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 8. To test on empty state of the application when it loaded
  it("should initialize with empty keyword and results (empty partition)", () => {
    const { result } = renderHook(() => useSearch(), { wrapper: SearchProvider });
    const [state] = result.current;
    expect(state).toEqual({ keyword: "", results: [] });
  });

  // 9. To test on perform searching on item. it should return dataa correctly 
  it("should update state to non-empty results (non-empty partition)", () => {
    const { result } = renderHook(() => useSearch(), { wrapper: SearchProvider });

    const mockResults = [{ id: 1, name: "Laptop" }];
    act(() => {
      const [, setState] = result.current;
      setState({ keyword: "laptop", results: mockResults });
    });

    const [state] = result.current;
    expect(state.keyword).toBe("laptop");
    expect(state.results).toEqual(mockResults);
  });

  // 10. Test on invalid or bad data inputs
  it("should handle invalid state update gracefully", () => {
    const { result } = renderHook(() => useSearch(), { wrapper: SearchProvider });

    act(() => {
      const [, setState] = result.current;
      setState(null);
    });

    const [state] = result.current;
    expect(state).toEqual(null);
  });
});
