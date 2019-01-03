async function createServer() {

    let Core = require('./core.js');
    let core = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
    await core.createPS();
    await core.importPowerCLI();

    async function login() {
        await core.connectVIServer();
    }

    await login();

    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/PCMS', {
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

    async function fetchLog() {
        await core.getVMHosts()
            .then(output => {
                let newHostPerf = new hostPerf({
                    time: Date.now(),
                    host: output[0].Name,
                    CPU: output[0].CpuUsageMhz,
                    Memory: output[0].MemoryUsageGB
                });
                newHostPerf.save(function (err) {
                    console.log("SAVED TO DATABASE");
                    if (err) {
                        console.error(err);
                    }
                });
            }).catch(err => {
                console.log(err);
            })
    }

    //Delay 1 miniutes
    let DELAY = 1000 * 60 * 1;

    //Fetch VMHosts data every DELAY value
    setInterval(await fetchLog, DELAY);
}

createServer();