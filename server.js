const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'signup',
});
// In your server file
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM login WHERE email = ? AND password = ?"; // Password comparison should be hashed

    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // On successful login
        return res.status(200).json({ message: "Login successful" });
    });
});


app.post('/signup', (req, res) => {
    const checkEmailSql = "SELECT * FROM login WHERE email = ?";
    const insertUserSql = "INSERT INTO login (`name`, `email`, `password`) VALUES (?)";
    
    const values = [
        req.body.name,
        req.body.email,
        req.body.password,
    ];

    // Check if the email already exists
    db.query(checkEmailSql, [req.body.email], (err, result) => {
        if (err) return res.json(err);
        
        if (result.length > 0) {
            // Email already exists
            return res.status(400).json({ message: "User already registered" });
        } else {
            // Insert new user
            db.query(insertUserSql, [values], (err, data) => {
                if (err) return res.json(err);
                return res.status(201).json({ message: "User registered successfully" });
            });
        }
    });
});

app.listen(8081, () => {
    console.log("Listening on port 8081...");
});
