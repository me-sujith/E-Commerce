const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
const cors = require('cors');
require('dotenv/config');
const app = express();

app.use(cors());
app.options('*', cors());

//Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(authJwt());
app.use(errorHandler);

//Routers
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');

app.use(`${process.env.API_URL}/products`, productsRouter);
app.use(`${process.env.API_URL}/categories`, categoriesRouter);
app.use(`${process.env.API_URL}/users`, usersRouter);
app.use(`${process.env.API_URL}/orders`, ordersRouter);

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log(`Database Connection Ready`);
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
