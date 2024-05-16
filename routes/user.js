const express = require('express');
const bcrypt = require('bcrypt');

const Model = require('../models/user');

const router = express.Router();
const {
  getLoggerUser,
  findDepartement,
  findOf,
  findDefaut
} = require('../helper/user_permission');

const endpoint = 'user';

//  Post  new User .
router.post(`/${endpoint}`, async (req, res) => {
  const user = await getLoggerUser(req.userId);

  if (!req.isAuth || !user.administrator) {
     return res.status(401).json({ message: 'Unauthenticated!' });
  }
  try {
    const checkUser = await Model.findOne({ email: req.body.email });
    const checkMatricule = await Model.findOne({ matricule: req.body.matricule });
    if(checkMatricule){
      return res.status(400).json({ message: 'matricule is already existe' });

    }

    if (!checkUser) {
      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      const data = new Model({
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
        matricule: req.body.matricule,
        departement: req.body.departement,
        administrator: req.body.administrator,
      });

      const dataToSave = await data.save();
      return res.status(200).json({ ...dataToSave._doc, password: null });
    } else {
      return res.status(400).json({ message: 'email is already existe' });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//  Get all available user.
router.get(`/${endpoint}`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const data = await Model.find();
    let response = [];
    data.forEach((user) => {
      response.push({ ...user._doc, password: null });
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
    return;
  }
});

//  Get user by ID or or NAME
router.get(`/${endpoint}/:id`, async (req, res) => {
  const user = await getLoggerUser(req.userId);
  try {
    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    } 
    
      const data = await Model.findById(req.params.id);
      return res.json(data);
    
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//  Update by ID Method
router.put(`/${endpoint}/:id`, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    } else {
      if (user.id != id && !user.administrator) {
        return res.status(401).json({ message: 'Unauthenticated!' });
      }
    }

    if (!user.administrator) {
      delete updatedData['administrator'];
    }
    if (updatedData['password']) {
      const hashedPassword = await bcrypt.hash(updatedData['password'], 12);
      updatedData['password'] = hashedPassword;
    }
    //// disable updating the relationshipp between the table ////
    if (updatedData['produits']) {
      delete updatedData['produits'];
    }
    if (updatedData['ofs']) {
      delete updatedData['ofs'];
    }
    if (updatedData['departements']) {
      delete updatedData['departements'];
    }
    if (updatedData['defauts']) {
      delete updatedData['defauts'];
    }
   
    
    const result = await Model.findByIdAndUpdate(id, updatedData, options);
    return res.status(200).json({ ...result._doc, password: null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


router.delete(`/${endpoint}/:id`, async (req, res) => {
  try {
    const userIsAdmin = await getLoggerUser(req.userId);
    if (!req.isAuth || !userIsAdmin.administrator) {
      return res.status(401).json({ message: "Unauthenticated!" });
    }
    const id = req.params.id;

  
    const data = await Model.findByIdAndDelete(id);
 
    res.send(`user has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/////////////// Manage user agencies   //////////////////////

router.delete(`/${endpoint}/produit`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const userId = req.body.user;
    const oldproduit = req.body.produit;
    const result = await Model.findById(userId);
    result.produits.pull(oldproduit);
    result.update({ _id: userId }, { $pull: { produits: oldproduit } });
    result.save();
    return res.status(200).json({ ...result._doc, password: null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.post(`/${endpoint}/Produit`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const userId = req.body.user;
    const newProduit = req.body.Produit;

    const checkProduit = await findProduit(newProduit);
    if (!checkProduit) {
      return res
        .status(400)
        .json({ message: 'there is no Produit with this ID' });
    }
    const result = await Model.findById(userId);
    const alreadyadded = result.produits.includes(newProduit);
    if (alreadyadded) {
      return res.status(200).json({ ...result._doc, password: null });
    }
    result.produits.push(newProduit);
    await result.save();

    return res.status(200).json({ ...result._doc, password: null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/////////////// Manage user departement   //////////////////////

router.delete(`/${endpoint}/departement`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const userId = req.body.user;
    const olddepartement = req.body.departement;
    const result = await Model.findById(userId);
    result.departements.pull(olddepartement);
    result.update({ _id: userId }, { $pull: { departements: olddepartement } });
    result.save();
    return res.status(200).json({ ...result._doc, password: null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.post(`/${endpoint}/departement`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }

    const userId = req.body.user;
    const newdepartement = req.body.departement;

    const checkdepartement = await findDepartement(newdepartement);
    if (!checkdepartement) {
      return res
        .status(400)
        .json({ message: 'there is no departement with this ID' });
    }
    const result = await Model.findById(userId);
    const alreadyadded = result.departements.includes(newdepartement);
    if (alreadyadded) {
      return res.status(200).json({ ...result._doc, password: null });
    }
    result.departements.push(newdepartement);
    await result.save();

    return res.status(200).json({ ...result._doc, password: null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/////////////// Manage user of   //////////////////////

router.delete(`/${endpoint}/of`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const userId = req.body.user;
    const oldof = req.body.of;
    const result = await Model.findById(userId);
    result.ofs.pull(oldof);
    result.update({ _id: userId }, { $pull: { ofs: oldof } });
    result.save();
    return res.status(200).json({ ...result._doc, password: null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.post(`/${endpoint}/of`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const userId = req.body.user;
    const newof = req.body.of;

    const checkof = await findOf(newof);
    if (!checkof) {
      return res.status(400).json({ message: 'there is no of with this ID' });
    }
    const result = await Model.findById(userId);
    const alreadyadded = result.ofs.includes(newof);
    if (alreadyadded) {
      return res.status(200).json({ ...result._doc, password: null });
    }
    result.ofs.push(newof);
    await result.save();

    return res.status(200).json({ ...result._doc, password: null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/////////////// Manage user defaut   //////////////////////

router.delete(`/${endpoint}/defaut`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }
    const userId = req.body.user;
    const olddefaut = req.body.defaut;
    const result = await Model.findById(userId);
    result.defauts.pull(olddefaut);
    result.update({ _id: userId }, { $pull: { defauts: olddefaut } });
    await result.save();
    return res.status(200).json({ ...result._doc, password: null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.post(`/${endpoint}/defaut`, async (req, res) => {
  try {
    const user = await getLoggerUser(req.userId);

    if (!req.isAuth || !user.administrator) {
      return res.status(401).json({ message: 'Unauthenticated!' });
    }

    const userId = req.body.user;
    const newdefaut = req.body.defaut;

    const checkdefaut = await findDefaut(newdefaut);
    if (!checkdefaut) {
      return res
        .status(400)
        .json({ message: 'there is no defaut with this ID' });
    }
    const result = await Model.findById(userId);
    const alreadyadded = result.defauts.includes(newdefaut);
    if (alreadyadded) {
      return res.status(200).json({ ...result._doc, password: null });
    }
    result.defauts.push(newdefaut);
    await result.save();

    return res.status(200).json({ ...result._doc, password: null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
