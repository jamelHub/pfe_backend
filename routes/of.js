const express = require('express');
const User = require('../models/user');
const router = express.Router();
const { getLoggerUser, getUserOfs } = require('../helper/user_permission');

const querystring = require('querystring');
const url = require('url');

const endpoint = 'of';

//  Post  new agancy .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }

    const ofsList = await getUserOfs(req.userId);

    const checkAgencyId = ofsList.ofs.some((of) => of.of_id == req.body.of_id);
    if (checkAgencyId) {
      return res.status(400).json({ message: 'This of_ids is already taken' });
    }
    const data = new Model({
      name: req.body.name,
    });

    const dataToSave = await data.save();
    user.ofs.push(dataToSave.id);
    await user.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//  Get all available agencies.
router.get(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const user = await getUserOfs(req.userId);

    if (user.administrator) {
      const urlParts = url.parse(req.url);
      const userId = querystring.parse(urlParts.query).userId;
      if (userId) {
        const data = await getUserOfs(userId);
        return res.json(data.ofs);
      }
      const ofs = await Model.find();
      return res.json(ofs);
    } else {
      const ofs = user.ofs;
      return res.json(ofs);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Get agency by ID or or NAME
router.get(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const user = await getUserOfs(req.userId);
    if (user.administrator) {
      const data = await Model.findById(req.params.id);
      return res.json(data);
    } else {
      const data = await user.ofs.find((of) => of._id == req.params.id);
      return res.json(data);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Update by ID Method
router.put(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };
    const user = await getUserOfs(req.userId);

    const of = await user.agencies.find((of) => of._id == req.params.id);
    if (!user.administrator && !of) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }

    delete updatedData['of_id'];

    const result = await Model.findByIdAndUpdate(id, updatedData, options);
    res.send(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
//  Delete by ID Method
router.delete(`/${endpoint}/:id`, async (req, res) => {
  try {
    const userIsAdmin = await getLoggerUser(req.userId);
    if (!req.isAuth || !userIsAdmin.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const id = req.params.id;
    const user = await getUserOfs(req.userId);

    const of = await user.ofs.find((of) => of._id == req.params.id);
    if (!user.administrator && !of) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const data = await Model.findByIdAndDelete(id);
    const user_of = await User.find({ ofs: { $in: [id] } });
    user_of.forEach((user) => {
      const index = user.ofs.findIndex((item) => item == id);
      user.ofs.splice(index, 1);
      user.save();
    });
    res.send(`ofs has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
