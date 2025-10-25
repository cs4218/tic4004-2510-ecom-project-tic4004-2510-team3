// tests/setup.js
import { test as setup } from '@playwright/test';

setup('create test user', async ({ request }) => {
  // Clean up any existing test user
  try {
    await request.delete('http://localhost:3000/api/test/cleanup');
  } catch (error) {
    console.log('Cleanup endpoint not available');
  }
  
  // Create test user for login tests
  const timestamp = Date.now();
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    phone: "1234567890",
    address: "Test Address",
    answer: "Football"
  };
  
  try {
    await request.post('http://localhost:3000/api/v1/auth/register', {
      data: testUser
    });
    console.log('Test user created successfully');
  } catch (error) {
    console.log('Test user may already exist or registration failed');
  }
});
