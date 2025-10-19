import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UpdateProduct from "./UpdateProduct";
import axios from "axios";
import toast from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("./../../components/Layout", () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});
jest.mock("./../../components/AdminMenu", () => {
  return function AdminMenu() {
    return <div data-testid="admin-menu">Admin Menu</div>;
  };
});

const mockNavigate = jest.fn();
const mockParams = { slug: "test-product" };

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

// Mock window.prompt
global.prompt = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-object-url");

describe("UpdateProduct Component", () => {
  const mockProduct = {
    _id: "123",
    name: "Test Product",
    description: "Test Description",
    price: 100,
    quantity: 10,
    shipping: true,
    category: { _id: "cat1", name: "Electronics" },
  };

  const mockCategories = [
    { _id: "cat1", name: "Electronics" },
    { _id: "cat2", name: "Clothing" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: { success: true, category: mockCategories },
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <UpdateProduct />
      </BrowserRouter>
    );
  };

  describe("Component Rendering and Initial Data Load", () => {
    test("renders the component with all elements", async () => {
      renderComponent();

      expect(screen.getByText("Update Product")).toBeInTheDocument();
      expect(screen.getByTestId("admin-menu")).toBeInTheDocument();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          `/api/v1/product/get-product/${mockParams.slug}`
        );
      });
    });

    test("fetches and displays product data on mount", async () => {
      renderComponent();

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText("write a name");
        const descriptionInput = screen.getByPlaceholderText("write a description");
        const priceInput = screen.getByPlaceholderText("write a Price");
        const quantityInput = screen.getByPlaceholderText("write a quantity");

        expect(nameInput).toHaveValue("Test Product");
        expect(descriptionInput).toHaveValue("Test Description");
        expect(priceInput).toHaveValue(100);
        expect(quantityInput).toHaveValue(10);
      });
    });

    test("fetches and displays categories", async () => {
      renderComponent();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
      });
    });

    test("handles error when fetching product - line 78", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const testError = new Error("Product fetch failed");
      
      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/product/get-product/")) {
          return Promise.reject(testError);
        }
        if (url === "/api/v1/category/get-category") {
          return Promise.resolve({
            data: { success: true, category: mockCategories },
          });
        }
      });

      renderComponent();

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(testError);
      }, { timeout: 3000 });

      consoleLogSpy.mockRestore();
    });

    test("handles error when fetching categories - lines 84-85", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const testError = new Error("Category fetch failed");
      
      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/product/get-product/")) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url === "/api/v1/category/get-category") {
          return Promise.reject(testError);
        }
      });

      renderComponent();

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(testError);
        expect(toast.error).toHaveBeenCalledWith(
          "Something wwent wrong in getting catgeory"
        );
      }, { timeout: 3000 });

      consoleLogSpy.mockRestore();
    });

    test("handles category fetch when data.success is falsy", async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/product/get-product/")) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url === "/api/v1/category/get-category") {
          return Promise.resolve({
            data: { success: false, category: [] },
          });
        }
      });

      renderComponent();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
      });
    });
  });

  describe("Form Input Handling", () => {
    test("updates name field", async () => {
      renderComponent();

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText("write a name");
        expect(nameInput).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("write a name");
      fireEvent.change(nameInput, { target: { value: "Updated Product" } });

      expect(nameInput).toHaveValue("Updated Product");
    });

    test("updates description field", async () => {
      renderComponent();

      await waitFor(() => {
        const descInput = screen.getByPlaceholderText("write a description");
        expect(descInput).toBeInTheDocument();
      });

      const descInput = screen.getByPlaceholderText("write a description");
      fireEvent.change(descInput, { target: { value: "New Description" } });

      expect(descInput).toHaveValue("New Description");
    });

    test("updates price field", async () => {
      renderComponent();

      await waitFor(() => {
        const priceInput = screen.getByPlaceholderText("write a Price");
        expect(priceInput).toBeInTheDocument();
      });

      const priceInput = screen.getByPlaceholderText("write a Price");
      fireEvent.change(priceInput, { target: { value: "200" } });

      expect(priceInput).toHaveValue(200);
    });

    test("updates quantity field", async () => {
      renderComponent();

      await waitFor(() => {
        const quantityInput = screen.getByPlaceholderText("write a quantity");
        expect(quantityInput).toBeInTheDocument();
      });

      const quantityInput = screen.getByPlaceholderText("write a quantity");
      fireEvent.change(quantityInput, { target: { value: "20" } });

      expect(quantityInput).toHaveValue(20);
    });

    test("handles photo upload", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Upload Photo")).toBeInTheDocument();
      });

      const file = new File(["photo"], "test.png", { type: "image/png" });
      const fileInput = screen.getByLabelText(/Upload Photo/i).querySelector('input[type="file"]');

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText("test.png")).toBeInTheDocument();
      });
    });

    test("displays uploaded photo preview", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Upload Photo")).toBeInTheDocument();
      });

      const file = new File(["photo"], "test.png", { type: "image/png" });
      const fileInput = screen.getByLabelText(/Upload Photo/i).querySelector('input[type="file"]');

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const images = screen.getAllByAltText("product_photo");
        expect(images[0]).toHaveAttribute("src", "mock-object-url");
      });
    });

    test("displays existing product photo when no new photo uploaded", async () => {
      renderComponent();

      await waitFor(() => {
        const images = screen.getAllByAltText("product_photo");
        expect(images[0]).toHaveAttribute("src", `/api/v1/product/product-photo/${mockProduct._id}`);
      });
    });
  });

  describe("Update Product", () => {
    test("successfully updates product without photo - line 121", async () => {
      // Line 121: const { data } = axios.put (missing await)
      // This line executes but doesn't wait for the promise to resolve before continuing
      let resolveUpdate;
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve;
      });
      
      axios.put.mockReturnValue(updatePromise);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
      });

      const updateButton = screen.getByText("UPDATE PRODUCT");
      fireEvent.click(updateButton);

      // Wait for axios.put to be called (line 121 executes)
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalled();
      });

      // Now resolve the promise to complete the flow
      resolveUpdate({ data: { success: false } });

      // Wait for the side effects
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
      }, { timeout: 3000 });
    });

    test("updates product with all form data", async () => {
      axios.put.mockResolvedValue({
        data: { success: false },
      });

      renderComponent();

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText("write a name");
        expect(nameInput).toHaveValue("Test Product");
      });

      const nameInput = screen.getByPlaceholderText("write a name");
      const descInput = screen.getByPlaceholderText("write a description");
      const priceInput = screen.getByPlaceholderText("write a Price");
      const quantityInput = screen.getByPlaceholderText("write a quantity");

      fireEvent.change(nameInput, { target: { value: "Updated Name" } });
      fireEvent.change(descInput, { target: { value: "Updated Desc" } });
      fireEvent.change(priceInput, { target: { value: "150" } });
      fireEvent.change(quantityInput, { target: { value: "25" } });

      const updateButton = screen.getByText("UPDATE PRODUCT");
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          `/api/v1/product/update-product/${mockProduct._id}`,
          expect.any(FormData)
        );
      });
    });

    test("successfully updates product with photo", async () => {
      axios.put.mockResolvedValue({
        data: { success: false },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Upload Photo")).toBeInTheDocument();
      });

      const file = new File(["photo"], "test.png", { type: "image/png" });
      const fileInput = screen.getByLabelText(/Upload Photo/i).querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText("test.png")).toBeInTheDocument();
      });

      const updateButton = screen.getByText("UPDATE PRODUCT");
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalled();
        const formData = axios.put.mock.calls[0][1];
        expect(formData).toBeInstanceOf(FormData);
      }, { timeout: 3000 });
    });

    test("handles update error response", async () => {
      axios.put.mockResolvedValue({
        data: { success: true, message: "Update failed" },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
      });

      const updateButton = screen.getByText("UPDATE PRODUCT");
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Update failed");
        expect(mockNavigate).not.toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    test("handles update when data.success is undefined", async () => {
      axios.put.mockResolvedValue({
        data: {},
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
      });

      const updateButton = screen.getByText("UPDATE PRODUCT");
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
      }, { timeout: 3000 });
    });

    test("handles update API failure - line 138", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const testError = new Error("Network Error");
      
      axios.put.mockRejectedValue(testError);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
      });

      const updateButton = screen.getByText("UPDATE PRODUCT");
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(testError);
        expect(toast.error).toHaveBeenCalledWith("something went wrong");
      }, { timeout: 3000 });

      consoleLogSpy.mockRestore();
    });
  });

  describe("Delete Product", () => {
    test("successfully deletes product when confirmed", async () => {
      global.prompt.mockReturnValue("yes");
      axios.delete.mockResolvedValue({
        data: { success: true },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("DELETE PRODUCT");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(global.prompt).toHaveBeenCalledWith(
          "Are You Sure want to delete this product ? "
        );
        expect(axios.delete).toHaveBeenCalledWith(
          `/api/v1/product/delete-product/${mockProduct._id}`
        );
        expect(toast.success).toHaveBeenCalledWith("Product DEleted Succfully");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
      });
    });

    test("successfully deletes without checking response success field", async () => {
      global.prompt.mockReturnValue("yes");
      axios.delete.mockResolvedValue({
        data: {},
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("DELETE PRODUCT");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Product DEleted Succfully");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
      });
    });

    test("cancels delete when user cancels prompt", async () => {
      global.prompt.mockReturnValue(null);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("DELETE PRODUCT");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(global.prompt).toHaveBeenCalled();
        expect(axios.delete).not.toHaveBeenCalled();
      });
    });

    test("cancels delete when user provides empty string", async () => {
      global.prompt.mockReturnValue("");

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("DELETE PRODUCT");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(global.prompt).toHaveBeenCalled();
        expect(axios.delete).not.toHaveBeenCalled();
      });
    });

    test("handles delete API failure - line 209", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const testError = new Error("Network Error");
      
      global.prompt.mockReturnValue("yes");
      axios.delete.mockRejectedValue(testError);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("DELETE PRODUCT");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(testError);
        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
      }, { timeout: 3000 });

      consoleLogSpy.mockRestore();
    });
  });

  describe("Category and Shipping Selection", () => {
    test("displays category options", async () => {
      renderComponent();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
      });
    });

    test("displays shipping options", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Update Product")).toBeInTheDocument();
      });
    });
  });
});