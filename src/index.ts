
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './api';
import * as MySQLConnector from './config/mysql.connector';
const app = express();
const port = 3737;

MySQLConnector.init();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', function(req, res) {
  res.render('pages/index');
});



app.use('/api',router);
//app.get('/', (req, res) => res.send('Express + TypeScript Server'));

  app.use((err, _req, res, next) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === 'UnauthorizedError') {
      return res
        .status(err.status)
        .send({ message: err.message })
        .end();
    }
    return next(err);
  });

  app.use((_req, _res, next) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
  });


  app.use((err, _req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  });  




app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});
