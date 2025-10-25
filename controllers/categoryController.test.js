import { 
    createCategoryController, 
    updateCategoryController, 
    deleteCategoryCOntroller,
    singleCategoryController 
} from '../controllers/categoryController.js';
import categoryModel from '../models/categoryModel.js';

jest.mock('../models/categoryModel.js');

describe('Category Controller Tests', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            body: {},
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

    // Test 6: Create Category - Successful Creation
    it('should create a new category successfully', async () => {
        // Arrange
        mockReq.body = { name: 'Electronics' };
        
        categoryModel.findOne.mockResolvedValue(null); // No existing category
        categoryModel.prototype.save.mockResolvedValue({
            _id: 'cat123',
            name: 'Electronics',
            slug: 'electronics'
        });

        // Act
        await createCategoryController(mockReq, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.send).toHaveBeenCalledWith({
            success: true,
            message: "new category created",
            category: expect.any(Object)
        });
    });

    // Test 7: Update Category - Successful Update
    it('should update category successfully', async () => {
        // Arrange
        mockReq.body = { name: 'Updated Electronics' };
        mockReq.params = { id: 'cat123' };

        const updatedCategory = {
            _id: 'cat123',
            name: 'Updated Electronics',
            slug: 'updated-electronics'
        };

        categoryModel.findByIdAndUpdate.mockResolvedValue(updatedCategory);

        // Act
        await updateCategoryController(mockReq, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
            success: true,
            messsage: "Category Updated Successfully",
            category: updatedCategory
        });
    });

    // Test 8: Delete Category - Successful Deletion
    it('should delete category successfully', async () => {
        // Arrange
        mockReq.params = { id: 'cat123' };
        categoryModel.findByIdAndDelete.mockResolvedValue(true);

        // Act
        await deleteCategoryCOntroller(mockReq, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
            success: true,
            message: "Categry Deleted Successfully"
        });
    });
});
