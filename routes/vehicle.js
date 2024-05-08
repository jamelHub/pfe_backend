const express = require("express");
const Model = require("../models/vehicle");
const router = express.Router();
const { getUserVehicles, getLoggerUser } = require("../helper/user_permission");

const querystring = require("querystring");
const url = require("url");

const endpoint = "vehicle";

//  Get all available vehicles.
router.get(`/${endpoint}`, async (req, res) => {
  if (!req.isAuth) {
    return res.status(401).json({ message: "Unauthenticated!" });
  }
  try {
    const user = await getLoggerUser(req.userId);

    if (user.administrator) {
      const urlParts = url.parse(req.url);
      const userId = querystring.parse(urlParts.query).userId;
      if (userId) {
        const data = await getUserVehicles(userId);
        return res.json(data.vehicles);
      }
      const vehicles = await Model.find();
      res.json(vehicles);
    } else {
      const vehicles = await getUserVehicles(req.userId);
      res.json(vehicles.vehicles);
    }
  } catch (error) {
  return  res.status(500).json({ message: error.message });
  }
});

//  Get vehicle by ID or or NAME
router.get(`/${endpoint}/:id`, async (req, res) => {
  if (!req.isAuth) {
    return res.status(401).json({ message: "Unauthenticated!" });
  }
  try {
    const name = req.query.name;
    const user = await getUserVehicles(req.userId);
    if (user.administrator) {
      if (name) {
        const data = await Model.findOne({ uniqueId: req.params.id });
        res.json(data);
      } else {
        const data = await Model.findById(req.params.id);
        res.json(data);
      }
    } else {
      if (name) {
        const data = await user.vehicles.find(
          (vehicle) => vehicle.uniqueId == req.params.id
        );
        res.json(data);
      } else {
        const data = await user.vehicles.find(
          (vehicle) => vehicle._id == req.params.id
        );
        res.json(data);
      }
    }
  } catch (error) {
   return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
