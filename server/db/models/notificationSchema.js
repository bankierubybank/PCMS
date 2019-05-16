let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let notificationSchema = new Schema({
    Name: String,
    Requestor: {
        Lecturer: String,
        Student: String,
        Course: String
    },
    Subject: String,
    Message: String
}, {
    collection: 'notifications'
})

module.exports = mongoose.model('notificationSchema', notificationSchema);