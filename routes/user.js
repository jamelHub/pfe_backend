const express = require("express");
const bcrypt = require("bcrypt");

const Model = require("../models/user");

const router = express.Router();
const {
  getLoggerUser,
} = require("../helper/user_permission");

const endpoint = "user";

//  Post  new User .
router.post(`/${endpoint}`, async (req, res) => {
  const user = await getLoggerUser(req.userId);

  if (!req.isAuth || !user.administrator) {
    return res.status(401).json({ message: "Unauthenticated!" });
  }
  try {
    const checkUser = await Model.findOne({ email: req.body.email });
    const checkMatricule = await Model.findOne({
      matricule: req.body.matricule,
    });
    if (checkMatricule) {
      return res.status(400).json({ message: "matricule is already existe" });
    }

    if (!checkUser) {
      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      const data = new Model({
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
        matricule: req.body.matricule,
        departement: req.body.departement,
        administrator: req.body.administrator,
      });

      const dataToSave = await data.save();
      return res.status(200).json({ ...dataToSave._doc, password: null });
    } else {
      return res.status(400).json({ message: "email is already existe" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//  Get all available user.
router.get(`/${endpoint}`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const data = await Model.find().populate('produits');
    let response = [];
    data.forEach((user) => {
      response.push({ ...user._doc, password: null });
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Get user by ID 
router.get(`/${endpoint}/:id`, async (req, res) => {
  const user = await getLoggerUser(req.userId);
  try {
    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }

    const data = await Model.findById(req.params.id);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Update by ID Method
router.put(`/${endpoint}/:id`, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    } else {
      if (user.id != id && !user.administrator) {
        return res.status(401).json({ message: "Unauthenticated!" });
      }
    }

    if (!user.administrator) {
      delete updatedData["administrator"];
    }
    if (updatedData["password"]) {
      const hashedPassword = await bcrypt.hash(updatedData["password"], 12);
      updatedData["password"] = hashedPassword;
    }
    const result = await Model.findByIdAndUpdate(id, updatedData, options);
    return res.status(200).json({ ...result._doc, password: null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete(`/${endpoint}/:id`, async (req, res) => {
  try {
    const userIsAdmin = await getLoggerUser(req.userId);
    if (!req.isAuth || !userIsAdmin.administrator) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const id = req.params.id;

    const data = await Model.findByIdAndDelete(id);

    res.send(`user has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
