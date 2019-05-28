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
    Requestor: {
        Lecturer: String,
        Student: String,
        Course: String
    },
    Type: String,
    Status: String,
    StartDate: Date,
    EndDate: Date,
    NewEndDate: Date
}, {
    collection: 'requested_vms'
})

module.exports = mongoose.model('requestedVmSchema', requestedVmSchema);