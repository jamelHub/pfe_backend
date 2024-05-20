const express = require('express');
const Model = require('../models/defaut');
const router = express.Router();
const { getLoggerUser } = require('../helper/user_permission');

const endpoint = 'defaut';

//  Post  new defaut .
router.post(`/${endpoint}`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }


 
    const data = new Model({
      code: req.body.code,
      designation: req.body.designation,
      totDefaux: req.body.totDefaux,
      qtDefaux : req.body.qtDefaux,
      departement: req.body.departement
      

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
      return res.status(401).json({ message: 'Unauthenticated!' });
    }

  
      const defauts = await Model.find().populate('departement');
      return res.json(defauts);
    
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Get agency by ID or or NAME
router.get(`/${endpoint}/:id`, async (req, res) => {
  try {
    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
      const data = await Model.findById(req.params.id).populate('departement');
      return res.json(data);
    
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
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const id = req.params.id;
 
    if (!user.administrator && !defaut) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const data = await Model.findByIdAndDelete(id);

    res.send(`defauts has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
