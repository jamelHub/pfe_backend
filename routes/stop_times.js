const express = require('express');
const Model = require('../models/stop_times');
const router = express.Router();
const {
  getLoggerUser,
  findStopTime,
  getUserStoptimes,
  findTrip,
  findStop,
  getTripsStoptimes,
} = require('../helper/user_permission');
const User = require('../models/user');
const querystring = require('querystring');
const url = require('url');

const endpoint = 'stoptime';

//TODO: arrival time // departure time

const compareTimes = (time1, time2) => {
  if (time1.getTime() < time2.getTime()) {
    return true;
  }
  return false;
};

router.post(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const user = await getLoggerUser(req.userId);

    if (!user.administrator && !user.trips.includes(req.body.trip_id)) {
      return res.status(400).json({ message: 'There is no trip with this ID' });
    }
    if (!user.administrator && !user.stops.includes(req.body.stop_id)) {
      return res.status(400).json({ message: 'There is no stop with this ID' });
    }
    /*  if (compareTimes(req.body.arrival_time, req.body.departure_time) ) {
      return res.status(400).json({
        message: 'The departure_time should be greater than the arrival_time',
      });
    }*/
    const data = new Model({
      name: req.body.name,
      arrival_time: req.body.arrival_time ? req.body.arrival_time : null,
      departure_time: req.body.departure_time ? req.body.departure_time : null,
      pickup_type: req.body.pickup_type,
      stop_headsign: req.body.stop_headsign,
      stop_id: req.body.stop_id,
      stop_sequence: req.body.stop_sequence,
      trip_id: req.body.trip_id,
    });
    const dataToSave = await data.save();
    user.stoptimes.push(dataToSave.id);
    await user.save();
    return res.status(200).json(dataToSave);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//  Get all available stoptime.
router.get(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const user = await getLoggerUser(req.userId);
    const urlParts = url.parse(req.url);
    const tripId = querystring.parse(urlParts.query).tripId;
    if (tripId) {
      const data = await getTripsStoptimes(tripId);
      return res.json(data);
    }
    if (user.administrator) {
      //    const urlParts = url.parse(req.url);
      const userId = querystring.parse(urlParts.query).userId;
      if (userId) {
        const data = await getUserStoptimes(userId);
        return res.json(data.stoptimes);
      }
      const data = await Model.find();
      return res.json(data);
    } else {
      const data = await getUserStoptimes(req.userId);
      return res.json(data.stoptimes);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Get stoptime by ID or or NAME
router.get(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const id = req.params.id;

    const user = await getLoggerUser(req.userId);

    const checkstoptime = await findStopTime(req.params.id);
    if (!checkstoptime) {
      return res
        .status(400)
        .json({ message: 'There is no stoptime with this ID' });
    }

    if (!user.administrator) {
      const alreadyadded = user.stoptimes.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: 'Unauthenticated' });
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
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };
    const user = await getLoggerUser(req.userId);

    const checkstoptime = await findStopTime(req.params.id);
    if (!checkstoptime) {
      return res
        .status(400)
        .json({ message: 'There is no stoptime with this ID' });
    }

    const checkstop = await findStop(updatedData.stop_id);
    const checktrip = await findTrip(updatedData.trip_id);
    if (!checktrip) {
      return res.status(400).json({ message: 'There is no trip with this ID' });
    }
    if (!checkstop) {
      return res.status(400).json({ message: 'There is no stop with this ID' });
    }

    /*
    if (compareTimes(updatedData.arrival_time, updatedData.departure_time)) {
      return res.status(400).json({
        message: 'The departure_time should be greater than the arrival_time',
      });
    }*/
    if (!user.administrator) {
      const alreadyadded = user.stoptimes.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: 'Unauthenticated' });
      }
    }
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
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const id = req.params.id;
    const user = await getLoggerUser(req.userId);
    if (!user.administrator) {
      const alreadyadded = user.stoptimes.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: 'Unauthenticated' });
      }
    }

    const data = await Model.findByIdAndDelete(id);
    const user_stoptimes = await User.find({ stoptimes: { $in: [id] } });
    user_stoptimes.forEach((user) => {
      const index = user.stoptimes.findIndex((item) => item == id);
      user.stoptimes.splice(index, 1);
      user.save();
    });

    res.send(`stoptime ${data.id} has been deleted..`);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
