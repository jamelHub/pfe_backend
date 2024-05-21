require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const produitRoutes = require('./routes/produit');
//const ofRoutes = require('./routes/calendar');
const departementRoutes = require('./routes/departement');
const defautRoutes = require('./routes/defaut');
const userRoutes = require('./routes/user');
const ofRoutes = require('./routes/of');
const fichieRoutes = require('./routes/fichier');



const sessionRoutes = require('./routes/session');

const isAuth = require('./middleware/is-auth');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const path = require('path');

const cookieParser = require('cookie-parser');

//const mongoString = 'mongodb://user:user@mongo:27017/gtfs';
const mongoString =
  'mongodb+srv://saadsarra:lShVKOce1U6mW4yP@mernapp.tttjjzq.mongodb.net/?retryWrites=true&w=majority&appName=MERNapp';
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
  console.log('database ', error);
});

database.once('connected', () => {
  console.log('Database Connected');
});
const app = express();
app.use(cors());
app.use(cookieParser());

app.use(express.json());
app.use(isAuth);

app.use('/api', ofRoutes);
app.use('/api', userRoutes);
app.use('/api', sessionRoutes);
app.use('/api', produitRoutes);
app.use('/api', departementRoutes);
app.use('/api', defautRoutes);
app.use('/api', fichieRoutes);





app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static(path.join(__dirname, 'build')));

/// Join the front-end app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const server = app.listen(8080, () => {
  console.log(`Server Started at ${8080}`);
});
