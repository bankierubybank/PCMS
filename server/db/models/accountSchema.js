let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let accountSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    collection: 'accounts'
});

module.exports = mongoose.model('accountSchema', accountSchema);
