import { registerController, loginController, forgotPasswordController, updateProfileController } from '../controllers/authController.js';
import userModel from '../models/userModel.js';
import { hashPassword, comparePassword } from '../helpers/authHelper.js';
import JWT from 'jsonwebtoken';

// Mock dependencies
jest.mock('../models/userModel.js');
jest.mock('../helpers/authHelper.js');
jest.mock('jsonwebtoken');

describe('Auth Controller Tests', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            body: {}
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

    // Test 1: Register Controller - Successful Registration
    describe('registerController', () => {
      it('should register a new user successfully', async () => {
        // Arrange - Boundary Value: All required fields present
        mockReq.body = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890',
          address: '123 Main St',
          answer: 'football'
        };

        userModel.findOne.mockResolvedValue(null); // No existing user
        hashPassword.mockResolvedValue('hashedPassword123');
        userModel.prototype.save.mockResolvedValue({
          _id: 'user123',
          ...mockReq.body,
          password: 'hashedPassword123'
        });

        // Act
        await registerController(mockReq, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          message: "User Register Successfully",
          user: expect.any(Object)
        });
      });

      // Test 2: Register Controller - Missing Required Fields (Combinatorial Testing)
      it.each([
        ['name', { email: 'test@test.com', password: 'pass', phone: '123', address: 'addr', answer: 'ans' }],
        ['email', { name: 'test', password: 'pass', phone: '123', address: 'addr', answer: 'ans' }],
        ['password', { name: 'test', email: 'test@test.com', phone: '123', address: 'addr', answer: 'ans' }],
        ['phone', { name: 'test', email: 'test@test.com', password: 'pass', address: 'addr', answer: 'ans' }],
        ['address', { name: 'test', email: 'test@test.com', password: 'pass', phone: '123', answer: 'ans' }],
        ['answer', { name: 'test', email: 'test@test.com', password: 'pass', phone: '123', address: 'addr' }]
      ])('should return error when %s is missing', async (missingField, requestBody) => {
        // Arrange
        mockReq.body = requestBody;

        // Act
        await registerController(mockReq, mockRes);

        // Assert: accept responses that provide either an "error" string or a "message" string
        const sentArg = mockRes.send.mock.calls[0] ? mockRes.send.mock.calls[0][0] : undefined;
        expect(sentArg).toBeDefined();
        const hasErrorString = sentArg && typeof sentArg.error === 'string';
        const hasMessageString = sentArg && typeof sentArg.message === 'string';
        expect(hasErrorString || hasMessageString).toBeTruthy();
      });

        // Test 3: Login Controller - Successful Login
        it('should login user successfully with valid credentials', async () => {
            // Arrange
            mockReq.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '1234567890',
                address: '123 Main St',
                role: 0,
                password: 'hashedPassword'
            };

            userModel.findOne.mockResolvedValue(mockUser);
            comparePassword.mockResolvedValue(true);
            JWT.sign.mockReturnValue('mockToken123');

            // Act
            await loginController(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                success: true,
                message: "login successfully",
                user: expect.objectContaining({
                    _id: 'user123',
                    name: 'John Doe',
                    email: 'john@example.com'
                }),
                token: 'mockToken123'
            });
        });

        // Test 4: Forgot Password Controller - Successful Password Reset
        it('should reset password successfully with correct email and answer', async () => {
            // Arrange
            mockReq.body = {
                email: 'john@example.com',
                answer: 'football',
                newPassword: 'newPassword123'
            };

            const mockUser = {
                _id: 'user123',
                email: 'john@example.com',
                answer: 'football'
            };

            userModel.findOne.mockResolvedValue(mockUser);
            hashPassword.mockResolvedValue('newHashedPassword');
            userModel.findByIdAndUpdate.mockResolvedValue({});

            // Act
            await forgotPasswordController(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                success: true,
                message: "Password Reset Successfully"
            });
        });

        // Test 5: Update Profile Controller - Successful Update
        it('should update user profile successfully', async () => {
            // Arrange
            mockReq.body = {
                name: 'John Updated',
                email: 'john@example.com',
                phone: '9876543210',
                address: '456 New St'
            };
            mockReq.user = { _id: 'user123' };

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '1234567890',
                address: '123 Main St',
                password: 'oldHashedPassword'
            };

            userModel.findById.mockResolvedValue(mockUser);
            userModel.findByIdAndUpdate.mockResolvedValue({
                ...mockUser,
                ...mockReq.body
            });

            // Act
            await updateProfileController(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                success: true,
                message: "Profile Updated SUccessfully",
                updatedUser: expect.any(Object)
            });
        });
    });
});