var mongoose = require('mongoose');
var dbURL = 'mongodb://localhost/PCMS';

mongoose.connect(dbURL, {
    useNewUrlParser: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});

var Schema = mongoose.Schema;
var hostPerfSchema = new Schema({
    time: Date,
    host: String,
    CPU: Number,
    Memory: Number
}, {
    collection: 'log'
});
var hostPerf = mongoose.model('hostPerf', hostPerfSchema);

async function saveHostPerf(jsondata) {
    let newHostPerf = new hostPerf({
        time: Date.now(),
        host: jsondata,
        CPU: jsondata,
        Memory: jsondata
    });
    newHostPerf.save(console.log("SAVED")).catch(err => console.log(err))
}

module.exports = mongoose.model('hostPerfSchema', hostPerfSchema);