import { 
    createProductController, 
    getProductController,
    getSingleProductController,
    deleteProductController
} from '../controllers/productController.js';
import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';

// Mock ALL dependencies at the top
jest.mock('../models/productModel.js');
jest.mock('../models/categoryModel.js');
jest.mock('fs');
jest.mock('braintree', () => ({
    BraintreeGateway: jest.fn().mockImplementation(() => ({
        clientToken: {
            generate: jest.fn()
        },
        transaction: {
            sale: jest.fn()
        }
    })),
    Environment: {
        Sandbox: 'sandbox'
    }
}));

// Mock environment variables
process.env.BRAINTREE_MERCHANT_ID = 'test_merchant_id';
process.env.BRAINTREE_PUBLIC_KEY = 'test_public_key';
process.env.BRAINTREE_PRIVATE_KEY = 'test_private_key';

describe('Product Controller Tests', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            fields: {},
            files: {},
            params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test 9: Create Product - Validation Errors (Boundary Value Analysis)
    it.each([
        ['name', { description: 'desc', price: 100, category: 'cat123', quantity: 10 }],
        ['description', { name: 'Product', price: 100, category: 'cat123', quantity: 10 }],
        ['price', { name: 'Product', description: 'desc', category: 'cat123', quantity: 10 }],
        ['category', { name: 'Product', description: 'desc', price: 100, quantity: 10 }],
        ['quantity', { name: 'Product', description: 'desc', price: 100, category: 'cat123' }]
    ])('should return error when %s is missing', async (missingField, fields) => {
        // Arrange
        mockReq.fields = fields;
        mockReq.files = {};

        // Act
        await createProductController(mockReq, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            error: expect.stringContaining('is Required')
        });
    });

    // Test 10: Get Products - Successful Retrieval
    it('should get all products successfully', async () => {
        // Arrange
        const mockProducts = [
            { _id: 'prod1', name: 'Product 1', price: 100, category: 'cat1' },
            { _id: 'prod2', name: 'Product 2', price: 200, category: 'cat2' }
        ];

        productModel.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockProducts)
        });

        // Act
        await getProductController(mockReq, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
            success: true,
            counTotal: mockProducts.length,
            message: "ALlProducts ",
            products: mockProducts
        });
    });
});