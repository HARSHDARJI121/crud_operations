require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database');
});

// Routes
app.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    res.render('index', { users: results });
  });
});
// Route to display the create user form
app.get('/create', (req, res) => {
  res.render('create'); // Renders the 'create.ejs' template
});

// POST request to add new user
app.post('/create', (req, res) => {
  const { name, email, phone } = req.body;

  // Ensure the columns match the structure in your database
  db.query('INSERT INTO users (name, email, phone_number) VALUES (?, ?, ?)', [name, email, phone], (err, results) => {
    if (err) {
      console.error('Error inserting user:', err);
      res.status(500).send('Error inserting user');
      return;
    }
    console.log('User added:', results);
    res.redirect('/');  // Redirect to home page after successful insert
  });
});



// Fetch the user data for editing
app.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) throw err;
    res.render('edit', { user: results[0] });
  });
});

app.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { name, email, phone } = req.body;

  console.log('Updating user with ID:', id);
  console.log('New data:', { name, email, phone });

  // Ensure the column name in DB is 'phone_number' (or update to match)
  db.query('UPDATE users SET name = ?, email = ?, phone_number = ? WHERE id = ?', [name, email, phone, id], (err) => {
    if (err) {
      console.error('Error updating user:', err);
      res.status(500).send('Error updating user');
      return;
    }
    res.redirect('/');  // Redirect to homepage after successful update
  });
});


// Handle user deletion
app.get('/delete/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.redirect('/');  // Redirect to homepage after deletion
  });
});

app.listen(5000, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
