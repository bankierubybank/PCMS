let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let hostPerfSchema = new Schema({
    time: Date,
    host: String,
    CPU: Number,
    Memory: Number
}, {
    collection: 'log'
});

module.exports = mongoose.model('hostPerfSchema', hostPerfSchema);