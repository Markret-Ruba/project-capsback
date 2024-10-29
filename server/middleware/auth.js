import jwt from 'jsonwebtoken';

const jwt = require('jsonwebtoken');

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Assume user is validated (e.g., checking email/password against the database)
  const user = { email };  // You would typically get the user from a database here
  
  // Create JWT token
  const token = jwt.sign(user, 'your_secret_key', { expiresIn: '1h' });
  
  // Send token in response
  res.json({ token });
});

