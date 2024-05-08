const express = require("express");
const Model = require("../models/stops");
const router = express.Router();
const {
  findStop,
  getUserStops,
  getLoggerUser,
  findStopID,
} = require("../helper/user_permission");
const querystring = require("querystring");
const url = require("url");
const User = require("../models/user");

const endpoint = "stop";

//  Post  new stop .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }

    const stopsList = await getUserStops(req.userId);

    const checkStopId = stopsList.stops.some(
      (stop) => stop.stop_id == req.body.stop_id
    );
    if (checkStopId) {
      return res.status(400).json({ message: "This stop_id is already taken" });
    }
    const data = new Model({
      stop_lat: req.body.stop_lat,
      stop_lon: req.body.stop_lon,
      stop_name: req.body.stop_name,
      stop_code: req.body.stop_code,
      stop_desc: req.body.stop_desc,
      stop_id: req.body.stop_id,
    });
    const user = await getLoggerUser(req.userId);
    const dataToSave = await data.save();
    user.stops.push(dataToSave.id);
    await user.save();
    return res.status(200).json(dataToSave);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//  Get all available stop.
router.get(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const user = await getLoggerUser(req.userId);
    if (user.administrator) {
      const urlParts = url.parse(req.url);
      const userId = querystring.parse(urlParts.query).userId;
      if (userId) {
        const data = await getUserStops(userId);
        return res.json(data.stops);
      }
      const data = await Model.find();
      return res.json(data);
    } else {
      const data = await getUserStops(req.userId);
      return res.json(data.stops);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Get stop by ID or or NAME
router.get(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const id = req.params.id;

    const user = await getLoggerUser(req.userId);

    const checkStop = await findStop(req.params.id);
    if (!checkStop) {
      return res.status(400).json({ message: "There is no stop with this ID" });
    }

    if (!user.administrator) {
      const alreadyadded = user.stops.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: "Unauthenticated" });
      }
    }
    const result = await Model.findById(id);
    res.send(result);
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
    const user = await getLoggerUser(req.userId);

    const checkStop = await findStop(req.params.id);
    if (!checkStop) {
      return res.status(400).json({ message: "There is no stop with this ID" });
    }

    if (!user.administrator) {
      const alreadyadded = user.stops.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: "Unauthenticated" });
      }
    }

    delete updatedData["stop_id"];

    const result = await Model.findByIdAndUpdate(id, updatedData, options);
    res.send(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Delete by ID Method
router.delete(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const id = req.params.id;
    const user = await getLoggerUser(req.userId);
    if (!user.administrator) {
      const alreadyadded = user.stops.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: "Unauthenticated" });
      }
    }

    const data = await Model.findByIdAndDelete(id);

    const user_stops = await User.find({ stops: { $in: [id] } });

    user_stops.forEach((user) => {
      const index = user.stops.findIndex((item) => item == id);
      user.stops.splice(index, 1);
      user.save();
    });

    res.send(`stop ${data.id} has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
