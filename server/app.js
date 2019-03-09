const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('./config/environments/test.json');
const router = require('./routes/router.js');
const logger = require('./controllers/logger.js');

async function createServer() {
	const app = express();
	app.use(compression());
	app.use(morgan('combined'));
	app.use(bodyParser.json());
	app.use(cors());
	app.use(helmet());

	app.use('/', router);

	app.listen(config.port, () => logger.info('App listen on port: ' + config.port));

}

createServer();