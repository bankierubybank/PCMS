let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let registeredVmSchema = new Schema({
    Name: String,
    Guest: String,
    NumCpu: Number,
    MemoryGB: Number,
    ProvisionedSpaceGB: Number,
    Requestor: String,
    StartDate: Date,
    EndDate: Date
}, {
    collection: 'registered_vms'
})

module.exports = mongoose.model('registeredVmSchema', registeredVmSchema);