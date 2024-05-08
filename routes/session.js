const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

const endpoint = 'session';
//  Post new Session .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: 'User does not exist! ' });
    }
    const isEqual = await bcrypt.compare(req.body.password, user.password);
    if (!isEqual) {
    return   res.status(400).json({ message: 'Password is incorrect! ' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'somesupersecretkey',
      {
        expiresIn: '24h',
      }
    );
    const expiresIn = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('ascii')
    ).exp;
   return  res.status(200).json({
      email: user.email,
      administrator: user.administrator,
      token: {
        data: token,
        expiresIn,
      },
    });
  } catch (error) {
   return  res.status(400).json({ message: error.message });
  }
});

module.exports = router;
