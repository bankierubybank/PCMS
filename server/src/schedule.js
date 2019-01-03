const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

async function createServer() {
    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors());

    let Core = require('./core.js');
    let core = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
    await core.createPS();
    await core.importPowerCLI();
    await core.connectVIServer();

    let schedule = require('node-schedule');

    app.get('/vm/:vmName/poweroff/10mins', async (req, res) => {
        let temp = schedule.scheduleJob(Date.now() + (1000 * 60 * 10), async function () {
            await core.powerOffVM(req.params.vmName)
                .then(output => {
                    console.log("DONE SCHEDULE JOB!");
                    res.json(output);
                }).catch(err => {
                    console.log(err);
                })
        })
    })

    app.listen(8081);
	console.log('App listen on port: 8081');
}

createServer();