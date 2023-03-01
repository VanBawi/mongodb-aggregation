const jwt = require('jsonwebtoken');

// Authorization Middleware
const authorizeMw = (req, res, next) => {
  console.log('Called Authorization Middleware');
  const token = req.header('auth-token');

  if (!token || token === 'null') {
    console.log('Unauthorized');
    res.status(401).json({ error: 'Action Denied, Unauthorized' });
  } else {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    try {
      // add to req.usertoken
      req.usertoken = decoded;
      console.log('Authorized and token verified');
      next();
    } catch {
      console.log('Authorized but token expired');
      res.status(400).json({ error: 'Token is not valid' });
    }
  }
};

module.exports = {
  authorizeMw,
};
