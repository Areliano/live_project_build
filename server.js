// Import packages/dependencies
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { check, validationResult } = require('express-validator');

const app = express();

// Middleware for sessions
app.use(session({
    secret: '2173eb-476eyuddi-6373271y3hsfdg-892tyunsn',
    resave: false,
    saveUninitialized: true
}));

// Create connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'newpassword',
    database: 'lms_app'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MYSQL: ' + err.stack); // Use console.error
        return;
    }
    console.log('Connected to MYSQL.');
});

app.use(express.static(__dirname));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true}));
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const User = {
    tableName: 'users',
    createUser: function(newUser, callback){
        connection.query('INSERT INTO ' + this.tableName + ' SET ?', newUser, callback);
    },
    getUserByEmail: function(email, callback){
        connection.query('SELECT * FROM ' + this.tableName + ' WHERE email = ?', [email], callback);
    },
    getUserByUsername: function(username, callback){
        connection.query('SELECT * FROM ' + this.tableName + ' WHERE username = ?', [username], callback);
    }           
};

app.post('/register', [
    // Validate email and username fields
    check('email').isEmail(),
    check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),

    // Custom validation to check if email and username are unique
    check('email').custom(async (value) => {
        return new Promise((resolve, reject) => {
            User.getUserByEmail(value, (err, user) => {
                if (err) {
                    return reject(new Error('Database error'));
                }
                if (user.length > 0) {
                    return reject(new Error('Email already exists'));
                }
                resolve(true);
            });
        });
    }),
    check('username').custom(async (value) => {
        return new Promise((resolve, reject) => {
            User.getUserByUsername(value, (err, user) => {
                if (err) {
                    return reject(new Error('Database error'));
                }
                if (user.length > 0) {
                    return reject(new Error('Username already exists'));
                }
                resolve(true);
            });
        });
    }),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create a new user object
    const newUser = {
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
        full_name: req.body.full_name
    };

    // Insert user into MYSQL
    User.createUser(newUser, (error, results, fields) => {
        if(error) {
            console.error('Error inserting user: ' + error.message);
            return res.status(500).json({ error: error.message });
        }
        console.log('Inserted a new user with ID ' + results.insertId);
        res.status(201).json(newUser);
    });
});

// Define the port
const PORT = process.env.PORT || 3000;

// Listen on the defined port
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`); // Use backticks for template literals
});
