const jwt = require('jsonwebtoken');

const login = (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error('Please add a password');
  }

  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
};

const logout = (req, res) => {
  res.cookie('adminToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const verify = (req, res) => {
  res.status(200).json({ authenticated: true });
};

module.exports = {
  login,
  logout,
  verify,
};
