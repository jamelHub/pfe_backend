const express = require("express");
const Model = require("../models/fichier");
const Defaut = require("../models/defaut");

const router = express.Router();
const { getLoggerUser } = require("../helper/user_permission");

const endpoint = "fichiers";

//  Post  new defaut .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    const {  defauts } = req.body;

    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }


    const defautIds = await Promise.all(defauts.map(async (defautData) => {
        const defaut = await Defaut.findOneAndUpdate(
            { code: defautData.code },
            defautData,
            { new: true, upsert: true }
        );
        return defaut._id;
    }));

   /* const dataDefauts = new defauts({
      code: req.body.defauts[0].code,
      designation: req.body.defauts[0].designation,
      qtDefauts: req.body.defauts[0].qtDefauts,
      totDefauts: req.body.defauts[0].totDefauts,
      departement: req.body.defauts[0].departement,
    });
*/

    const data = new Model({
      user: user._id,
      defauts: defautIds,
    });

    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//  Get all available defaux.
router.get(`/${endpoint}`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }

    const fichier = await Model.find().populate('defauts');
    return res.json(fichier);
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
    const data = await Model.findById(req.params.id).populate("defauts");
    return res.json(data);
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

    if (!userIsAdmin.administrator) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const data = await Model.findByIdAndDelete(id);

    res.send(`fichier has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
