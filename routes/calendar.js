const express = require('express');
const Model = require('../models/calendar');
const Trip = require('../models/trips');
const StopTimes = require('../models/stop_times');

const router = express.Router();
const { getLoggerUser } = require('../helper/user_permission');
const { findCalendar, getUserCalendars } = require('../helper/user_permission');
const User = require('../models/user');
const querystring = require('querystring');
const url = require('url');

const endpoint = 'calendar';

//  Post  new calendar .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    if (req.body.start_date > req.body.end_date) {
      return res.status(400).json({ message: 'End date < start date' });
    }

    const data = new Model({
      name: req.body.name,
      Monday: req.body.Monday,
      Tuesday: req.body.Tuesday,
      Wednesday: req.body.Wednesday,
      Thursday: req.body.Thursday,
      Friday: req.body.Friday,
      Saturday: req.body.Saturday,
      Sunday: req.body.Sunday,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
    });
    const user = await getLoggerUser(req.userId);
    const dataToSave = await data.save();
    user.calendars.push(dataToSave.id);
    await user.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//  Get all available calendar.
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
        const data = await getUserCalendars(userId);
        return res.json(data.calendars);
      }
      const data = await Model.find();
      return res.json(data);
    } else {
      const data = await getUserCalendars(req.userId);
      return res.json(data.calendars);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Get calendar by ID  or NAME
router.get(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const id = req.params.id;
    const user = await getLoggerUser(req.userId);
    const checkCalendar = await findCalendar(req.params.id);
    if (!checkCalendar) {
      return res
        .status(400)
        .json({ message: 'There is no calendar with this ID' });
    }

    if (!user.administrator) {
      const alreadyadded = user.calendars.includes(req.params.id);
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

    const checkCalendar = await findCalendar(req.params.id);
    if (!checkCalendar) {
      return res
        .status(400)
        .json({ message: 'There is no calendar with this ID' });
    }

    if (!user.administrator) {
      const alreadyadded = user.calendars.includes(req.params.id);
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
      const alreadyadded = user.calendars.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: 'Unauthenticated' });
      }
    }

    const data = await Model.findByIdAndDelete(id);
    const user_calendars = await User.find({ calendars: { $in: [id] } });

    const listofTrips = await Trip.find({ route_id: id }).select('_id');

    const deletedeleteStoptimesIds = await StopTimes.find({});

    const deletedIds = listofTrips.map((doc) => doc._id);

    const deleteTrips = await Trip.deleteMany({ route_id: id });

    const deleteStoptimes = await StopTimes.deleteMany({
      trip_id: deletedIds,
    });


    user_calendars.forEach((user) => {
      const calendar_index = user.calendars.findIndex((item) => item == id);
      user.calendars.splice(calendar_index, 1);

      user.trips.find((element) => !deletedIds.includes(element));
      user.save();
    });

    res.send(`calendar ${data.id} has been deleted..`);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
