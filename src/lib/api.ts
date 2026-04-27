// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API helper functions
export const api = {
  // Signup
  async signup(email: string, password: string, name: string, goals: string[] = []) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, goals }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    
    return response.json();
  },

  // Login
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },

  // Get all users (for discover)
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  },

  // Get health data
  async getHealthData(email: string) {
    const response = await fetch(`${API_BASE_URL}/health-data/${email}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch health data');
    }
    
    return response.json();
  },

  // Save health data
  async saveHealthData(email: string, data: any[]) {
    const response = await fetch(`${API_BASE_URL}/health-data/${email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save health data');
    }
    
    return response.json();
  },
};
