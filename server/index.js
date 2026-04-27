const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const HEALTH_DATA_DIR = path.join(DATA_DIR, 'health-data');
const FRIENDS_FILE = path.join(DATA_DIR, 'friends.json');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(HEALTH_DATA_DIR)) {
  fs.mkdirSync(HEALTH_DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(FRIENDS_FILE)) {
  fs.writeFileSync(FRIENDS_FILE, JSON.stringify({}));
}

// Helper functions
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readHealthData(email) {
  const filePath = path.join(HEALTH_DATA_DIR, `${email}.json`);
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeHealthData(email, data) {
  const filePath = path.join(HEALTH_DATA_DIR, `${email}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ============ API Routes ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BioSync API is running' });
});

// Get all users (for discover feature)
app.get('/api/users', (req, res) => {
  const users = readUsers();
  // Return users without passwords
  const safeUsers = users.map(({ password, ...user }) => user);
  res.json(safeUsers);
});

// Signup
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name, goals } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  
  const users = readUsers();
  
  // Check if user already exists (case-insensitive)
  const existingUser = users.find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );
  
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    email: email.toLowerCase(),
    password, // In production, hash this with bcrypt
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    goals: goals || [],
    joinedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeUsers(users);
  
  // Create empty health data file
  writeHealthData(newUser.email, []);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    message: 'User created successfully',
    user: userWithoutPassword
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const users = readUsers();
  
  // Case-insensitive email search
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );
  
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email' });
  }
  
  if (user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    message: 'Login successful',
    user: userWithoutPassword
  });
});

// Get user's health data
app.get('/api/health-data/:email', (req, res) => {
  const email = req.params.email.toLowerCase();
  const healthData = readHealthData(email);
  res.json(healthData);
});

// Save user's health data
app.post('/api/health-data/:email', (req, res) => {
  const email = req.params.email.toLowerCase();
  const healthData = req.body;
  writeHealthData(email, healthData);
  res.json({ message: 'Health data saved successfully' });
});

// Get friends
app.get('/api/friends/:email', (req, res) => {
  const email = req.params.email.toLowerCase();
  const friendsData = readUsers();
  const friends = readUsers();
  
  // In a real app, you'd have a proper friends table
  // For now, return all users except the current one
  const otherUsers = friends
    .filter(u => u.email !== email)
    .map(({ password, ...user }) => user);
  
  res.json(otherUsers);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BioSync API server running on port ${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`👥 Users file: ${USERS_FILE}`);
});

module.exports = app;
