let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let VMPerfSchema = new Schema({
    Name: String,
    stats: [{
        timestamp: Date,
        PowerState: Boolean,
        CPU: Number,
        Memory: Number,
        Disk: Number
    }]
}, {
    collection: 'logs'
})

module.exports = mongoose.model('VMPerfSchema', VMPerfSchema);