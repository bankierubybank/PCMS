let express = require('express');
let app = express();
let routes = require('./Routes.js');

/*
let morgan = require('morgan');
app.use(morgan('dev'));
*/

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000);
console.log('App listening on port ' + '3000');
app.use(routes.createCore());
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:' + 3000);

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Pass to next layer of middleware
  next();
})
app.get('/', function (req, res, next) {
  res.send('Home');
})