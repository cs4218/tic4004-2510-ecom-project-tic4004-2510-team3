import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { SearchProvider, useSearch } from "./search";

// Dummy component to simulate UI interaction
const SearchComponent = ({ mockResults }) => {
  const [search, setSearch] = useSearch();

  return (
    <>
      <input
        placeholder="Search Keyword"
        value={search.keyword}
        onChange={(e) => setSearch({ ...search, keyword: e.target.value })}
      />
      <button
        onClick={() =>
          setSearch({
            ...search,
            results: mockResults || [
              { _id: "1", name: "Laptop", price: 1499.99 },
            ],
          })
        }
      >
        Search
      </button>

      <div data-testid="keyword">{search.keyword}</div>
      <ul data-testid="results">
        {search.results.map((item) => (
          <li key={item._id}>{item.name}</li>
        ))}
      </ul>
    </>
  );
};

describe("Search Component (Output-Based Tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Testing on seach input and search button is appear on DOM
  it("renders input and search button", () => {
    const { getByPlaceholderText, getByText } = render(
      <SearchProvider>
        <SearchComponent />
      </SearchProvider>
    );

    expect(getByPlaceholderText("Search Keyword")).toBeInTheDocument();
    expect(getByText("Search")).toBeInTheDocument();
  });

  // Testing for user keyword 
  it("updates keyword when typing", () => {
    const { getByPlaceholderText, getByTestId } = render(
      <SearchProvider>
        <SearchComponent />
      </SearchProvider>
    );

    const input = getByPlaceholderText("Search Keyword");
    fireEvent.change(input, { target: { value: "Laptop" } });

    expect(getByTestId("keyword").textContent).toBe("Laptop");
  });

  // Testing for search result after press on search button
  it("displays a single search result", () => {
    const { getByText, getByTestId } = render(
      <SearchProvider>
        <SearchComponent />
      </SearchProvider>
    );

    fireEvent.click(getByText("Search"));

    const results = getByTestId("results");
    expect(results.children).toHaveLength(1);
    expect(results.children[0].textContent).toBe("Laptop");
  });

  // Testing for multiple item with same keyword whether the item will display after search button press
  it("displays multiple results for the same keyword", () => {
    const twoItems = [
      { _id: "2", name: "Gaming Laptop", price: 2000 },
      { _id: "3", name: "Corporate Laptop", price: 1500 },
    ];

    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SearchProvider>
        <SearchComponent mockResults={twoItems} />
      </SearchProvider>
    );

    fireEvent.change(getByPlaceholderText("Search Keyword"), { target: { value: "Laptop" } });
    fireEvent.click(getByText("Search"));

    const results = getByTestId("results");
    expect(results.children).toHaveLength(2);
    expect(results.children[0].textContent).toBe("Gaming Laptop");
    expect(results.children[1].textContent).toBe("Corporate Laptop");
  });
});
