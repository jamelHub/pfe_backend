const express = require('express');
const Model = require('../models/trips');
const router = express.Router();
const {
  getLoggerUser,
  findTrip,
  getUserTrips,
  tripsPopulale,
  AlltripsPopulale,
} = require('../helper/user_permission');

const User = require('../models/user');
const Stoptimes = require('../models/stop_times');

const querystring = require('querystring');
const url = require('url');
const endpoint = 'trip';

//  Post  new trip .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }

    const user = await getLoggerUser(req.userId);

    const tripsList = await getUserTrips(req.userId);
    const checkTripId = tripsList.trips.some(
      (trip) => trip.trip_id == req.body.trip_id
    );
    if (checkTripId) {
      return res
        .status(400)
        .json({ message: 'There is already a trip_id for this trip' });
    }
    const checkroute = user.routes.toString();
    if (!user.administrator && !checkroute.includes(req.body.route_id)) {
      return res
        .status(400)
        .json({ message: 'There is no route with this ID' });
    }

    const checkService = user.calendars.toString();
    if (!user.administrator && !checkService.includes(req.body.service_id)) {
      return res
        .status(400)
        .json({ message: 'There is no service with this ID' });
    }

    const checkVehicle = user.vehicles.toString();
  

    if (!checkVehicle.includes(req.body.vehicle_id)) {
      return res
        .status(400)
        .json({ message: 'There is no vehicle with this ID' });
    }
    const data = new Model({
      block_id: req.body.block_id,
      direction_id: req.body.direction_id,
      route_id: req.body.route_id,
      service_id: req.body.service_id,
      shape_id: req.body.shape_id,
      trip_headsign: req.body.trip_headsign,
      trip_short_name: req.body.trip_short_name,
      vehicle_id: req.body.vehicle_id,
      trip_id: req.body.trip_id,
      schedule_relationship: req.body.schedule_relationship,
    });

    const dataToSave = await data.save();
    user.trips.push(dataToSave.id);
    await user.save();
    return res.status(200).json(dataToSave);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//  Get all available trip.
router.get(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const user = await getLoggerUser(req.userId);
    if (user.administrator) {
      const urlParts = url.parse(req.url);
      const userId = querystring.parse(urlParts.query).userId;
      if (userId) {
        const data = await getUserTrips(userId);
        return res.json(data.trips);
      }
      const data = await Model.find();
      return res.json(data);
    } else {
      const data = await getUserTrips(req.userId);
      return res.json(data.trips);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get(`/${endpoint}/all`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const user = await getLoggerUser(req.userId);
    const urlParts = url.parse(req.url);

    const vehicleId = querystring.parse(urlParts.query).vehicleId;
    const calendarId = querystring.parse(urlParts.query).calendarId;
    let data = {};
    let tripsList = {};
    if (user.administrator) {
      const userId = querystring.parse(urlParts.query).userId;
      if (userId) {
        data = await tripsPopulale(userId);
        tripsList = data.trips;
      } else {
        data = await AlltripsPopulale();
        tripsList = data;
      }
    } else {
      data = await tripsPopulale(req.userId);
      tripsList = data.trips;
    }
    let filterData = tripsList;
    if (vehicleId && !calendarId) {
      filterData = tripsList.filter((item) => item.vehicle_id._id == vehicleId);
    }
    if (calendarId && !vehicleId) {
      filterData = tripsList.filter(
        (item) => item.service_id._id == calendarId
      );
    }
    if (calendarId && vehicleId) {
      filterData = tripsList.filter(
        (item) =>
          item.service_id._id == calendarId && item.vehicle_id._id == vehicleId
      );
    }
    return res.json(filterData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Get trip by ID or or NAME
router.get(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const id = req.params.id;

    const user = await getLoggerUser(req.userId);

    const checkTrip = await findTrip(req.params.id);
    if (!checkTrip) {
      return res.status(400).json({ message: 'There is no trip with this ID' });
    }

    if (!user.administrator) {
      const alreadyadded = user.trips.includes(req.params.id);
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

    const checkTrip = await findTrip(req.params.id);
    if (!checkTrip) {
      return res.status(400).json({ message: 'There is no trip with this ID' });
    }

    const checkroute = user.routes.toString();
    if (!user.administrator && !checkroute.includes(req.body.route_id)) {
      return res
        .status(400)
        .json({ message: 'There is no route with this ID' });
    }

    const checkService = user.calendars.toString();
    if (!user.administrator && !checkService.includes(req.body.service_id)) {
      return res
        .status(400)
        .json({ message: 'There is no service with this ID' });
    }

    const checkVehicle = user.vehicles.toString();

    if (!user.administrator && !checkVehicle.includes(req.body.vehicle_id)) {
      return res
        .status(400)
        .json({ message: 'There is no vehicle with this ID' });
    }

    if (!user.administrator) {
      const alreadyadded = user.trips.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: 'Unauthenticated' });
      }
    }

    //  delete updatedData["trip_id"];
    const trips_list = await getUserTrips(user.id);

    trips_same_ids = trips_list.trips.filter(
      (trip) => trip.trip_id == updatedData['trip_id']
    );
    if (trips_same_ids.length >= 1 && id != trips_same_ids[0]._id.toString()) {
      return res
        .status(400)
        .json({ message: 'There is already a trip with the same trip id' });
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
      const alreadyadded = user.trips.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: 'Unauthenticated' });
      }
    }

    const data = await Model.findByIdAndDelete(id);
    const deleteStopTimes = await Stoptimes.deleteMany({ trip_id: id });
    const user_trips = await User.find({ trips: { $in: [id] } });

    user_trips.forEach((user) => {
      const index = user.trips.findIndex((item) => item == id);
      user.trips.splice(index, 1);
      user.save();
    });

    res.send(`trip ${data.id} has been deleted ..`);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
