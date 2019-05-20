let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let quotaSchema = new Schema({
    Name: String,
    NumCpu: Number,
    MemoryGB: Number,
    ProvisionedSpaceGB: Number,
    Users: Number
}, {
    collection: 'quota'
})

module.exports = mongoose.model('quotaSchema', quotaSchema);