import jwt from 'jsonwebtoken';

const checkAuth = (req, res, next) => {
  // Get token from the header
  const token = req.header('Authorization').split(' ')[1]; // Extract token from "Bearer token"

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default checkAuth;
