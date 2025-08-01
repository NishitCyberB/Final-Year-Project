const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
exports.register = async (req, res) => {
  const { fullName, email, password, dob, gender, role = 'client' } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      dob,
      gender,
      role
    });

    await newUser.save();

    res.status(201).json({ message: `User registered successfully as ${role}.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '2h'
    });

    // Match frontend redirects
    const redirectMap = {
      hotel: 'hotelmanagerdashboard.html',
      guide: 'agentdashboard.html',
      client: 'places.html',
      admin: 'admin/dashboard.html'
    };

    const redirectUrl = redirectMap[user.role] || 'places.html';

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        role: user.role
      },
      redirectUrl
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
