const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { getLoggerUser, getUserAgencies } = require("../helper/user_permission");

const querystring = require("querystring");
const url = require("url");

const endpoint = "produit";

//  Post  new agancy .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }

    const produitsList = await getUserProduits(req.userId);

    const checkAgencyId = produitsList.produits.some(
      (produit) => produit.produit_id == req.body.produit_id
    );
    if (checkAgencyId) {
      return res
        .status(400)
        .json({ message: "This produit_id is already taken" });
    }
    const data = new Model({
      produit_name: req.body.produit_name,
      
      produit_id: req.body.produit_id,
    });

    const dataToSave = await data.save();
    user.produits.push(dataToSave.id);
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
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const user = await getUserAgencies(req.userId);

    if (user.administrator) {
      const urlParts = url.parse(req.url);
      const userId = querystring.parse(urlParts.query).userId;
      if (userId) {
        const data = await getUserAgencies(userId);
        return res.json(data.agencies);
      }
      const agencies = await Model.find();
      return res.json(agencies);
    } else {
      const agencies = user.agencies;
      return res.json(agencies);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Get agency by ID or or NAME
router.get(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const name = req.query.name;
    const user = await getUserAgencies(req.userId);
    if (user.administrator) {
      if (name) {
        const data = await Model.findOne({ agency_name: req.params.id });
        return res.json(data);
      } else {
        const data = await Model.findById(req.params.id);
        return res.json(data);
      }
    } else {
      if (name) {
        const data = await user.agencies.find(
          (agency) => agency.agency_name == req.params.id
        );
        return res.json(data);
      } else {
        const data = await user.agencies.find(
          (agency) => agency._id == req.params.id
        );
        return res.json(data);
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Update by ID Method
router.put(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };
    const user = await getUserAgencies(req.userId);

    const agency = await user.agencies.find(
      (agency) => agency._id == req.params.id
    );
    if (!user.administrator && !agency) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }

    delete updatedData["agency_id"];

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
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const id = req.params.id;
    const user = await getUserAgencies(req.userId);

    const agency = await user.agencies.find(
      (agency) => agency._id == req.params.id
    );
    if (!user.administrator && !agency) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }

    const data = await Model.findByIdAndDelete(id);
    const user_agency = await User.find({ agencies: { $in: [id] } });

    user_agency.forEach((user) => {
      const index = user.agencies.findIndex((item) => item == id);
      user.agencies.splice(index, 1);
      user.save();
    });

    res.send(`Agency ${data.agency_name} has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;