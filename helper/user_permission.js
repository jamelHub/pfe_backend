const User = require('../models/user');
const Produit = require('../models/produit');
const Of = require('../models/of');

const Departement = require('../models/departement');

const Defaut = require('../models/defaut');

exports.getUserProduit = async (userId) =>
  await User.findById(userId).populate('produits');

exports.getUserOfs = async (userId) =>
  await User.findById(userId).populate('ofs');

exports.getUserDepartements = async (userId) =>
  await User.findById(userId).populate('departements');

exports.getUserDefaut = async (userId) =>
  await User.findById(userId).populate('defaut');

exports.getLoggerUser = async (userId) => await User.findById(userId);
exports.findProduit = async (produitId) => await Produit.findById(produitId);
exports.findOf = async (OfId) => await Of.findById(OfId);
exports.findDepartement = async (departementId) =>
  await Departement.findById(departementId);
exports.findDefaut = async (defautId) => await Defaut.findById(defautId);



//exports. findStopTimeBytripAndSequence = async (tripId, stop_sequence) => await StopTime.find({ trip_id: tripId, stop_sequence: stop_sequence });

exports.findStopTimeBytripAndSequence = async (userId, seq, trip_id) =>
  await User.findById(userId).populate({
    model: 'stoptime',
    path: 'stoptimes',
    match: { stop_sequence: { $eq: seq }, trip_id: { $eq: trip_id } },
  });

exports.tripsPopulale = async (userId) =>
  await User.findById(userId).populate({
    path: 'trips',
    model: 'trips',
    populate: [
      {
        path: 'service_id',
        model: 'calendar',
      },
      {
        path: 'route_id',
        model: 'routes',
      },
      {
        path: 'vehicle_id',
        model: 'vehicles',
      },
    ],
  });

exports.AlltripsPopulale = async () =>
  await Trip.find().populate([
    {
      path: 'service_id',
      model: 'calendar',
    },
    {
      path: 'route_id',
      model: 'routes',
    },
    {
      path: 'vehicle_id',
      model: 'vehicles',
    },
  ]);

exports.findTripID = async (tripId) => await Trip.find({ trip_id: tripId });
exports.findStopID = async (stopId) => await Stop.find({ stop_id: stopId });
exports.findAgencyID = async (agencyId) =>
  await Agency.find({ agency_id: agencyId });
exports.findRouteID = async (routeId) =>
  await Route.find({ route_id: routeId });
exports.getTripsStoptimes = async (tripid) =>
  await StopTime.find({ trip_id: tripid });
