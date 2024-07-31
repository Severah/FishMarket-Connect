const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fishermen'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to the database.');
});

// Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sign Up Route
app.post('/signup', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).send('Missing required fields');
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('Error hashing password');
        }

        // Insert user into the database
        const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [username, hashedPassword, role], (err, result) => {
            if (err) {
                return res.status(500).send('Error signing up');
            }
            res.send('User registered successfully');
        });
    });
});

// Log In Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).send('Error logging in');
        }
        if (results.length === 0) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Error comparing passwords');
            }
            if (!isMatch) {
                return res.status(401).send({ message: 'Invalid credentials' });
            }

            // Set session
            req.session.userId = user.id;
            req.session.role = user.role;
            res.send({ message: 'Login successful', sessionId: req.session.id, role: user.role });
        });
    });
});

// Log Out Route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.send('Logged out successfully');
    });
});

// Fish Management Routes

// Get all fish
app.get('/fish', (req, res) => {
    const query = 'SELECT * FROM fish';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving fish');
        }
        res.json(results);
    });
});

// Add new fish
app.post('/fish', (req, res) => {
    const { type, price, quantity } = req.body;
    if (!type || price === undefined || quantity === undefined) {
        return res.status(400).send('Missing required fields');
    }

    const query = 'INSERT INTO fish (type, price_per_kg, quantity) VALUES (?, ?, ?)';
    db.query(query, [type, price, quantity], (err, result) => {
        if (err) {
            return res.status(500).send('Error adding fish');
        }
        res.json({ success: true });
    });
});

// Update fish
app.put('/fish', (req, res) => {
    const { id, type, price, quantity } = req.body;
    if (!id || (type === undefined && price === undefined && quantity === undefined)) {
        return res.status(400).send('Missing required fields');
    }

    const updates = [];
    const queryValues = [];

    if (type !== undefined) {
        updates.push('type = ?');
        queryValues.push(type);
    }
    if (price !== undefined) {
        updates.push('price_per_kg = ?');
        queryValues.push(price);
    }
    if (quantity !== undefined) {
        updates.push('quantity = ?');
        queryValues.push(quantity);
    }

    queryValues.push(id);

    const query = `UPDATE fish SET ${updates.join(', ')} WHERE id = ?`;
    db.query(query, queryValues, (err, result) => {
        if (err) {
            return res.status(500).send('Error updating fish');
        }
        res.json({ success: true });
    });
});

// Delete fish
app.delete('/fish', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).send('Missing required field: id');
    }

    const query = 'DELETE FROM fish WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).send('Error deleting fish');
        }
        res.json({ success: true });
    });
});

// Order Fish
app.post('/order', (req, res) => {
    const { fishId, quantity } = req.body;
    if (!fishId || !quantity) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    // Get the fish details
    const getFishQuery = 'SELECT * FROM fish WHERE id = ?';
    db.query(getFishQuery, [fishId], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving fish');
        }
        if (results.length === 0) {
            return res.status(404).send({ message: 'Fish not found' });
        }

        const fish = results[0];
        if (fish.quantity < quantity) {
            return res.status(400).send({ message: 'Not enough quantity available' });
        }

        // Update the quantity
        const updateFishQuery = 'UPDATE fish SET quantity = quantity - ? WHERE id = ?';
        db.query(updateFishQuery, [quantity, fishId], (err, result) => {
            if (err) {
                return res.status(500).send('Error ordering fish');
            }
            res.json({ success: true });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
