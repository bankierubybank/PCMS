let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let vmTemplateSchema = new Schema({
    Name: String,
    Guest: String,
    GuestVersion: String,
    VMwareToolsVersion: String,
    DiskGB: Number
}, {
    collection: 'vm_templates'
})

module.exports = mongoose.model('vmTemplateSchema', vmTemplateSchema);