const express = require("express");
const router = express.Router();
const TodayTimetable = require("../timetable/today_timetable");

const endpoint = "timetable";

router.get(`/${endpoint}`, async (req, res) => {
  try {
    const timetable = new TodayTimetable(new Date());
    const result = await timetable.create();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get(`/${endpoint}/:agency/:stop`, async (req, res) => {
  try {
    const agency = req.params.agency;
    const stop = req.params.stop;

    const timetable = new TodayTimetable(new Date());
    const result = await timetable.timetableBystop(agency, stop);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get(`/${endpoint}/:agency`, async (req, res) => {
  try {
    const agency = req.params.agency;

    const timetable = new TodayTimetable(new Date());
    const result = await timetable.timetableByagency(agency);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

const endpointbyTime = "timetablebytime";

router.get(`/${endpointbyTime}/:date`, async (req, res) => {
  try {
    const date = req.params.date;
    const timetable = new TodayTimetable(new Date(date));
    const result = await timetable.create();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.get(`/${endpointbyTime}/:date/:agency/:stop`, async (req, res) => {
  try {
    const agency = req.params.agency;
    const stop = req.params.stop;
    const date = req.params.date;
    const timetable = new TodayTimetable(new Date(date));
    const result = await timetable.timetableBystop(agency, stop);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.get(`/${endpointbyTime}/:date/:agency`, async (req, res) => {
  try {
    const agency = req.params.agency;
    const date = req.params.date;
    const timetable = new TodayTimetable(new Date(date));
    const result = await timetable.timetableByagency(agency);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
