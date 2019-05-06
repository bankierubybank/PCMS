let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let requestedVmSchema = new Schema({
    Name: String,
    Id: String,
    Guest: String,
    NumCpu: Number,
    MemoryGB: Number,
    ProvisionedSpaceGB: Number,
    OS: String,
    Requestor: String,
    Status: String,
    StartDate: Date,
    EndDate: Date
}, {
    collection: 'registered_vms'
})

module.exports = mongoose.model('requestedVmSchema', requestedVmSchema);