const Transport = require('../models/Transport');

exports.getTransports = async (req, res) => {
  try {
    const transports = await Transport.find();
    res.json(transports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addTransport = async (req, res) => {
  try {
    const newTransport = new Transport(req.body);
    await newTransport.save();
    res.status(201).json(newTransport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
