const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const PORT = 8081;
const router = require('../routes/router.js')

async function createServer() {
	const app = express();
	app.use(compression());
	app.use(morgan('combined'));
	app.use(bodyParser.json());
	app.use(cors());
	app.use(helmet());

	app.use('/', router);

	app.listen(PORT, () => console.log('App listen on port: ' + PORT));

}

createServer();