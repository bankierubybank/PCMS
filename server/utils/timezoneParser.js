const moment = require('moment');
const momentTimezone = require('moment-timezone');
const current_timezone = 'Asia/Bangkok';

/**
 * Return a string of ISODate in current timezone.
 * @param {String} date A string of ISODate. (Ex. '2019-03-09T10:37:00.000Z')
 */
const changeTimezone = async (date) => {
    return await momentTimezone.tz(date, current_timezone).format();
}

/**
 * Return a string of today ISODate in current timezone.
 */
const toDay = async () => {
    return await momentTimezone.tz(new Date().toISOString(), current_timezone).format();
}

module.exports = {
    changeTimezone,
    toDay
};