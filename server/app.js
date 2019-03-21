const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('./config/environments/test.json');
const router = require('./routes/router.js');
const logger = require('./controllers/logger.js');
const dbConnector = require('./db/dbConnector.js');
const session = require('express-session');

async function createServer() {
	const app = express();
	app.use(compression());
	app.use(morgan('combined'));
	app.use(bodyParser.json());
	app.use(cors());
	app.use(helmet());
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true
    }))

	app.use('/', router);

	await dbConnector.connect(config.mongodb_url);
	let server = await app.listen(config.port, () => logger.info('App listen on port: ' + config.port));

	process.on('SIGINT', () => {
		logger.warn('Application Terminated!')
		server.close((err) => {
			logger.error(err)
			process.exit(1)
		})
	})
}

createServer();