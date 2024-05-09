const express = require('express');
const User = require('../models/user');
const router = express.Router();
const { getLoggerUser, getUserDefaut } = require('../helper/user_permission');

const querystring = require('querystring');
const url = require('url');

const endpoint = 'defaut';

//  Post  new agancy .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }

    const defautList = await getUserDefaut(req.userId);

    const checkDefautId = defautList.departements.some(
      (defaut) => defaut.defaut_id == req.body.defaut_id
    );
    if (checkDefautId) {
      return res
        .status(400)
        .json({ message: 'This departement_ids is already taken' });
    }
    const data = new Model({
      code: req.body.code,
      designation: req.body.designation,
      nbre_produit: req.body.nbre_produit,
    });

    const dataToSave = await data.save();
    user.defauts.push(dataToSave.id);
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
    const user = await getUserDefaut(req.userId);

    if (user.administrator) {
      const urlParts = url.parse(req.url);
      const userId = querystring.parse(urlParts.query).userId;
      if (userId) {
        const data = await getUserDefaut(userId);
        return res.json(data.departements);
      }
      const defauts = await Model.find();
      return res.json(defauts);
    } else {
      const defauts = user.defauts;
      return res.json(defauts);
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
    const user = await getUserDefaut(req.userId);
    if (user.administrator) {
      const data = await Model.findById(req.params.id);
      return res.json(data);
    } else {
      const data = await user.defauts.find((defaut) => defaut._id == req.params.id);
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
    const user = await getUserDefaut(req.userId);

    const defaut = await user.defauts.find((defaut) => defaut._id == req.params.id);
    if (!user.administrator && !defaut) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }

    delete updatedData['defaut_id'];

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
    const user = await getUserDefaut(req.userId);

    const defaut = await user.defauts.find((defaut) => defaut._id == req.params.id);
    if (!user.administrator && !defaut) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const data = await Model.findByIdAndDelete(id);
    const user_defaut = await User.find({ defauts: { $in: [id] } });
    user_defaut.forEach((user) => {
      const index = user.defauts.findIndex((item) => item == id);
      user.defauts.splice(index, 1);
      user.save();
    });
    res.send(`defauts has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
