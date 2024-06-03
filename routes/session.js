const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Product = require('../models/produit');
const router = express.Router();
const endpoint = 'session';

//  Post new Session .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    const rfid = req.body.rfid;

    if (rfid) {
      const user = await User.findOne({
        rfid: rfid,
      }).populate('produits');
      const products = await Product.find({
        _id: { $in: user.produits },
      }).populate({
        path: 'ofs',
        populate: {
          path: 'departements',
          model: 'departement',
          populate: {
            path: 'fichiers',
            model: 'fichier',
            populate: {
              path: 'defauts',
              model: 'defaut',
            },
          },
        },
      });
      return res.status(200).json({
        email: user.email,
        matricule: user.matricule,
        administrator: user.administrator,
        produits: products,
        token: {
          data: token,
          expiresIn,
        },
      });
    }

    const user = await User.findOne({ matricule: req.body.matricule }).populate(
      'produits'
    );
    const products = await Product.find({
      _id: { $in: user.produits },
    }).populate({
      path: 'ofs',
      populate: {
        path: 'departements',
        model: 'departement',
        populate: {
          path: 'fichiers',
          model: 'fichier',
          populate: {
            path: 'defauts',
            model: 'defaut',
          },
        },
      },
    });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist! ' });
    }
    const isEqual = await bcrypt.compare(req.body.password, user.password);
    if (!isEqual) {
      return res.status(400).json({ message: 'Password is incorrect! ' });
    }

    const token = jwt.sign(
      { userId: user.id, matricule: user.matricule },
      'somesupersecretkey',
      {
        expiresIn: '24h',
      }
    );
    const expiresIn = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('ascii')
    ).exp;
    return res.status(200).json({
      email: user.email,
      matricule: user.matricule,
      administrator: user.administrator,
      produits: products,
      token: {
        data: token,
        expiresIn,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
