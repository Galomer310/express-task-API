const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid'); // For unique user IDs
const router = express.Router();

const filePath = './users.json';

// Helper to read users from JSON
const readUsers = async () => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Helper to write users to JSON
const writeUsers = async (users) => {
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));
};

// Register route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = await readUsers();
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), username, password: hashedPassword };
    users.push(newUser);
    await writeUsers(users);

    res.status(201).json({ message: 'User registered successfully' });
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await readUsers();
    const user = users.find(user => user.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.json({ message: 'Login successful' });
});

// Retrieve all users
router.get('/users', async (req, res) => {
    const users = await readUsers();
    res.json(users);
});

// Retrieve a specific user by ID
router.get('/users/:id', async (req, res) => {
    const users = await readUsers();
    const user = users.find(user => user.id === req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
});

// Update a user's information by ID
router.put('/users/:id', async (req, res) => {
    const { username, password } = req.body;
    const users = await readUsers();
    const userIndex = users.findIndex(user => user.id === req.params.id);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (username) users[userIndex].username = username;
    if (password) users[userIndex].password = await bcrypt.hash(password, 10);

    await writeUsers(users);
    res.json({ message: 'User updated successfully' });
});

module.exports = router;
