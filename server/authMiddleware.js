const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  // Step 1: Get token from request header
  const authHeader = req.headers['authorization'];
  
  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }
  
  // Token format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  // We need to extract the token part
  const token = authHeader.split(' ')[1];  // Get the part after "Bearer "
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. Invalid token format.' 
    });
  }
  
  // Step 2: Verify the token
  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (err) {
      return res.status(401).json({ 
        error: 'Invalid or expired token.',
        details: err.message 
      });
    }
    
    // Step 3: Token is valid! Save user info to request
    req.user = decoded;  // Contains { id, email }
    
    // Step 4: Continue to the actual route
    next();
  });
}

module.exports = verifyToken;