const express = require('express');
const Model = require('../models/departement');
const router = express.Router();
const { getLoggerUser, getUserDepartements } = require('../helper/user_permission');

const querystring = require('querystring');
const url = require('url');

const endpoint = 'departement';

//  Post  new agancy .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }

    const departementList = await getUserDepartements(req.userId);

    const checkDepartementId = departementList.departements.some(
      (of) => of.of_id == req.body.of_id
    );
    if (checkDepartementId) {
      return res
        .status(400)
        .json({ message: 'This departement_ids is already taken' });
    }
    const data = new Model({
      name: req.body.name,
    });

    const dataToSave = await data.save();
    user.departements.push(dataToSave.id);
    await user.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//  Get all available departements.
router.get(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const user = await getUserDepartements(req.userId);

    if (user.administrator) {
      const urlParts = url.parse(req.url);
      const userId = querystring.parse(urlParts.query).userId;
      if (userId) {
        const data = await getUserDepartements(userId);
        return res.json(data.departements);
      }
      const departements = await Model.find();
      return res.json(departements);
    } else {
      const departements = user.departements;
      return res.json(departements);
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
    const user = await getUserDepartements(req.userId);
    if (user.administrator) {
      const data = await Model.findById(req.params.id);
      return res.json(data);
    } else {
      const data = await user.departements.find((departement) => departement._id == req.params.id);
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
    const user = await getUserDepartements(req.userId);

    const departement = await user.departements.find((departement) => departement._id == req.params.id);
    if (!user.administrator && !departement) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }

    delete updatedData['departement_id'];

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
    const user = await getUserDepartements(req.userId);

    const departement = await user.departements.find((departement) => departement._id == req.params.id);
    if (!user.administrator && !departement) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const data = await Model.findByIdAndDelete(id);
    const user_departement = await User.find({ departements: { $in: [id] } });
    user_departement.forEach((user) => {
      const index = user.departements.findIndex((item) => item == id);
      user.departements.splice(index, 1);
      user.save();
    });
    res.send(`departement has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
