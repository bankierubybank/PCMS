const mongoose = require('mongoose');
const logger = require('../controllers/logger.js');

/**
 * Connect to MongoDB.
 * @param {String} mongodb_url A string of MongoDB URL.
 */
async function connect(mongodb_url) {
    mongoose.connect(mongodb_url, {
        useNewUrlParser: true,
        useFindAndModify: false
    });

    let db = mongoose.connection;
    db.on('error', (err) => logger.error(err));
    db.once('open', () => {
        logger.info('Mongoose connection is open to ' + mongodb_url);
    });

    process.on('SIGINT', () => {
        mongoose.connection.close(() => logger.warn('Mongoose connection is disconnected due to application termination!'));
        process.exit(0);
    })
}

module.exports = {
    connect
};