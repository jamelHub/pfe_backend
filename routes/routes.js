const express = require("express");
const Model = require("../models/routes");
const router = express.Router();

const {
  getLoggerUser,
  findRoute,
  getUserRoutes,
  findAgency,
} = require("../helper/user_permission");

const User = require("../models/user");

const Trip = require("../models/trips");
const Stoptimes = require("../models/stop_times");

const querystring = require("querystring");
const url = require("url");

const endpoint = "route";

router.post(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }

    const user = await getLoggerUser(req.userId);

    if (!user.agencies.includes(req.body.agency_id)) {
      return res
        .status(400)
        .json({ message: "There is no Agency with this ID" });
    }
    const routesList = await getUserRoutes(req.userId);

    const checkRouteId = routesList.routes.some(
      (route) => route.route_id == req.body.route_id
    );
    if (checkRouteId) {
      return res
        .status(400)
        .json({ message: "This route_id is already taken" });
    }
    const data = new Model({
      agency_id: req.body.agency_id,
      route_color: req.body.route_color,
      route_desc: req.body.route_desc,
      route_long_name: req.body.route_long_name,
      route_short_name: req.body.route_short_name,
      route_text_color: req.body.route_text_color,
      route_type: req.body.route_type,
      route_url: req.body.route_url,
      route_id: req.body.route_id,
    });
    const dataToSave = await data.save();
    user.routes.push(dataToSave.id);
    await user.save();
    return res.status(200).json(dataToSave);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
//  Get all available route.
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
        const data = await getUserRoutes(userId);
        return res.json(data.routes);
      }
      const data = await Model.find();
      return res.json(data);
    } else {
      const data = await getUserRoutes(req.userId);
      return res.json(data.routes);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
//  Get route by ID or or NAME
router.get(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const id = req.params.id;

    const user = await getLoggerUser(req.userId);

    const checkroute = await findRoute(req.params.id);
    if (!checkroute) {
      return res
        .status(400)
        .json({ message: "There is no route with this ID" });
    }

    if (!user.administrator) {
      const alreadyadded = user.routes.includes(req.params.id);
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

    const checkAgency = await findAgency(req.body.agency_id);
    if (!checkAgency) {
      return res
        .status(400)
        .json({ message: "There is no Agency with this ID" });
    }

    if (!user.administrator) {
      const alreadyadded = user.routes.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: "Unauthenticated" });
      }
    }
    delete updatedData["route_id"];
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
      const alreadyadded = user.routes.includes(req.params.id);
      if (!alreadyadded) {
        return res.status(401).json({ message: "Unauthenticated" });
      }
    }

    const listofTrips = await Trip.find({ route_id: id }).select("_id");
    const deletedIds = listofTrips.map((doc) => doc._id);
    const deleteTrips = await Trip.deleteMany({ route_id: id });
    const deleteStoptimes = await Stoptimes.deleteMany({
      trip_id: deletedIds,
    });
    const data = await Model.findByIdAndDelete(id);

    const user_routes = await User.find({ routes: { $in: [id] } });

    user_routes.forEach((user) => {
      const index = user.routes.findIndex((item) => item == id);
      user.routes.splice(index, 1);
      user.save();
    });
    res.send(`route ${data.id} has been deleted..`);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
