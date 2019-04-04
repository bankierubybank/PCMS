let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let VMPerfSchema = new Schema({
    Name: String,
    stats: [{
        timestamp: Date,
        PoweredStatus: String
    }]
}, {
    collection: 'logs'
})

module.exports = mongoose.model('VMPerfSchema', VMPerfSchema);